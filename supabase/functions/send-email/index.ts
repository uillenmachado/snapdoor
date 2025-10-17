// ============================================
// SUPABASE EDGE FUNCTION: send-email
// ============================================
// Objetivo: Enviar emails via Resend e registrar em activities
// Uso: Chamada via supabase.functions.invoke('send-email', { body: {...} })

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'https://esm.sh/resend@2.0.0';

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Validar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // 2. Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 3. Verificar usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // 4. Parse do body
    const { dealId, leadId, companyId, to, cc, bcc, subject, html, text } = await req.json();

    // Validações
    if (!to || to.length === 0) {
      throw new Error('Missing recipient (to)');
    }
    if (!subject || subject.trim() === '') {
      throw new Error('Missing subject');
    }
    if (!html && !text) {
      throw new Error('Missing email body (html or text)');
    }

    // 5. Buscar integração de email ativa do usuário (OPCIONAL)
    const { data: emailIntegration, error: integrationError } = await supabaseClient
      .from('email_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // 6. Inicializar Resend - USA INTEGRAÇÃO DO USUÁRIO OU FALLBACK PARA SISTEMA
    let resend;
    let fromEmail;
    let usingUserIntegration = false;

    if (emailIntegration && !integrationError) {
      // ✅ MODO PRODUÇÃO: Usar integração do usuário
      console.log('📧 Usando integração do usuário:', {
        provider: emailIntegration.provider,
        email: emailIntegration.email,
        isVerified: emailIntegration.is_verified,
      });

      if (emailIntegration.provider === 'resend') {
        if (!emailIntegration.api_key) {
          throw new Error('API Key do Resend não configurada na integração');
        }
        resend = new Resend(emailIntegration.api_key);
        fromEmail = emailIntegration.email;
        usingUserIntegration = true;
      } else if (emailIntegration.provider === 'smtp') {
        // TODO: Implementar envio via SMTP customizado
        throw new Error('Envio via SMTP ainda não implementado. Use Resend por enquanto.');
      } else {
        throw new Error(`Provedor ${emailIntegration.provider} não suportado`);
      }
    } else {
      // ✅ MODO TESTE: Usar credenciais globais do sistema (FALLBACK)
      console.log('⚠️ Nenhuma integração configurada. Usando email do sistema para testes.');
      
      const systemApiKey = Deno.env.get('RESEND_API_KEY');
      const systemEmail = Deno.env.get('RESEND_FROM_EMAIL');
      const systemName = Deno.env.get('RESEND_FROM_NAME') || 'SnapDoor CRM';

      if (!systemApiKey || !systemEmail) {
        throw new Error(
          'Email do sistema não configurado. Configure uma integração em Configurações > Integração para enviar emails.'
        );
      }

      resend = new Resend(systemApiKey);
      fromEmail = `${systemName} <${systemEmail}>`;
      usingUserIntegration = false;
    }

    // 7. Preparar dados do email
    const emailData: any = {
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
    };

    if (html) emailData.html = html;
    if (text) emailData.text = text;
    if (cc && cc.length > 0) emailData.cc = cc;
    if (bcc && bcc.length > 0) emailData.bcc = bcc;

    // Adicionar tracking headers
    if (dealId) {
      emailData.headers = {
        'X-Entity-Ref-ID': dealId,
      };
    }

    // 7. Enviar email via Resend
    const { data: emailResult, error: emailError } = await resend.emails.send(emailData);

    if (emailError) {
      console.error('Resend error:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log('Email sent successfully:', emailResult);

    // 8. Atualizar last_used_at da integração (se estiver usando integração do usuário)
    if (usingUserIntegration && emailIntegration) {
      await supabaseClient
        .from('email_integrations')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', emailIntegration.id);
    }

    // 9. Salvar atividade no banco
    const { data: activity, error: activityError } = await supabaseClient
      .from('activities')
      .insert({
        user_id: user.id,
        deal_id: dealId || null,
        lead_id: leadId || null,
        company_id: companyId || null,
        type: 'email',
        direction: 'outbound',
        status: 'sent',
        data: {
          subject: subject,
          body_html: html,
          body_text: text,
          to: Array.isArray(to) ? to : [to],
          cc: cc || [],
          bcc: bcc || [],
          from: fromEmail,
          provider: usingUserIntegration ? emailIntegration?.provider : 'system',
          using_system_email: !usingUserIntegration,
          message_id: emailResult.id,
        },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (activityError) {
      console.error('Error saving activity:', activityError);
      // Não falhar a requisição se só o salvamento falhou
    }

    // 10. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResult.id,
        activityId: activity?.id,
        provider: usingUserIntegration ? emailIntegration?.provider : 'system',
        from: fromEmail,
        usingSystemEmail: !usingUserIntegration,
        message: usingUserIntegration 
          ? 'Email enviado com sucesso!' 
          : 'Email enviado com sucesso! (usando email do sistema para testes)',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge Function para enviar emails usando Gmail API via OAuth2
 * 
 * Utiliza os tokens OAuth2 armazenados na tabela email_integrations
 * para enviar emails usando a conta Gmail do usuário.
 * 
 * Fluxo:
 * 1. Autentica o usuário
 * 2. Busca integração Gmail ativa
 * 3. Verifica validade do token (refresh se necessário)
 * 4. Envia email via Gmail API
 * 5. Registra atividade no banco
 */

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  dealId?: string;
  leadId?: string;
}

interface EmailIntegration {
  id: string;
  user_id: string;
  provider: string;
  email: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  oauth_scopes: string[];
}

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // 1. Authenticate user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // 2. Get request body
    const emailRequest: EmailRequest = await req.json();
    const { to, subject, body, dealId, leadId } = emailRequest;

    console.log(`📧 Enviando email para: ${to}`);
    console.log(`👤 Usuário: ${user.email}`);

    // 3. Get active Gmail integration
    const { data: integration, error: integrationError } = await supabaseClient
      .from("email_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "gmail")
      .eq("is_active", true)
      .maybeSingle() as { data: EmailIntegration | null; error: any };

    if (integrationError) {
      console.error("❌ Erro ao buscar integração:", integrationError);
      throw new Error("Erro ao buscar integração Gmail");
    }

    if (!integration) {
      throw new Error("Gmail não conectado. Configure sua conta do Google em Configurações > Integrações.");
    }

    console.log(`✅ Integração Gmail encontrada: ${integration.email}`);

    // 4. Check if token is expired and refresh if needed
    let accessToken = integration.access_token;
    const tokenExpiresAt = new Date(integration.token_expires_at);
    const now = new Date();

    if (tokenExpiresAt <= now) {
      console.log("🔄 Token expirado, renovando...");

      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Deno.env.get("GOOGLE_CLIENT_ID"),
          client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET"),
          refresh_token: integration.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text();
        console.error("❌ Erro ao renovar token:", errorText);
        throw new Error("Erro ao renovar token do Gmail. Reconecte sua conta do Google.");
      }

      const refreshData: RefreshTokenResponse = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update token in database
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000);
      await supabaseClient
        .from("email_integrations")
        .update({
          access_token: accessToken,
          token_expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);

      console.log("✅ Token renovado com sucesso");
    }

    // 5. Build email in RFC 2822 format
    const emailLines = [
      `To: ${to}`,
      `From: ${integration.email}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      ``,
      body,
    ];

    const email = emailLines.join("\r\n");

    // 6. Encode email to base64url
    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(email);
    const base64 = btoa(String.fromCharCode(...emailBytes));
    const base64url = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 7. Send via Gmail API
    console.log("📤 Enviando via Gmail API...");

    const gmailResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: base64url,
        }),
      }
    );

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text();
      console.error("❌ Erro ao enviar email via Gmail API:", errorText);
      throw new Error(`Erro ao enviar email: ${errorText}`);
    }

    const gmailResult = await gmailResponse.json();
    console.log("✅ Email enviado com sucesso! ID:", gmailResult.id);

    // 8. Save activity
    const activityData = {
      user_id: user.id,
      type: "email",
      data: {
        gmail_message_id: gmailResult.id,
        from: integration.email,
        to,
        subject,
        provider: "gmail",
        threadId: gmailResult.threadId,
      },
    };

    if (dealId) {
      (activityData as any).deal_id = dealId;
    }
    if (leadId) {
      (activityData as any).lead_id = leadId;
    }

    const { error: activityError } = await supabaseClient
      .from("activities")
      .insert(activityData);

    if (activityError) {
      console.error("⚠️ Erro ao salvar atividade:", activityError);
      // Não falha o envio se apenas o log falhar
    }

    // 9. Update last_used_at
    await supabaseClient
      .from("email_integrations")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", integration.id);

    // 10. Return success
    return new Response(
      JSON.stringify({
        success: true,
        messageId: gmailResult.id,
        threadId: gmailResult.threadId,
        from: integration.email,
        provider: "gmail",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("❌ Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro desconhecido ao enviar email",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

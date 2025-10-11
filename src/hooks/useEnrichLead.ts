// =====================================================
// HOOK: useEnrichLead
// Gerencia o enriquecimento de leads com a API Hunter.io
// =====================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { leadEnrichmentService, EnrichmentOptions } from '@/services/leadEnrichmentService';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { isDevAccount } from '@/lib/devAccount';

interface EnrichLeadParams {
  leadId: string;
  leadData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    company?: string;
    company_domain?: string;
    linkedin_url?: string;
  };
  options?: EnrichmentOptions;
}

export function useEnrichLead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, leadData, options }: EnrichLeadParams) => {
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Calcular créditos necessários
      const { total: creditsNeeded } = leadEnrichmentService.calculateCreditsNeeded(
        leadData,
        options
      );

      console.log(`💰 Créditos necessários: ${creditsNeeded}`);

      // 2. Verificar créditos disponíveis (exceto dev account)
      if (!isDevAccount(user)) {
        const { data: userCreditsData, error: userCreditsError } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', user.id)
          .single();

        if (userCreditsError) {
          console.error('Erro ao buscar créditos:', userCreditsError);
          throw new Error('Erro ao verificar créditos disponíveis');
        }

        const availableCredits = userCreditsData?.credits || 0;

        if (availableCredits < creditsNeeded) {
          throw new Error(
            `Créditos insuficientes. Necessário: ${creditsNeeded}, Disponível: ${availableCredits}`
          );
        }
      }

      // 3. Enriquecer o lead
      const result = await leadEnrichmentService.enrichLead(leadId, leadData, options);

      if (!result.success) {
        // Mensagem mais amigável - enriquecimento parcial é válido
        console.warn('⚠️ Enriquecimento parcial:', result);
        // Não lança erro se algum dado foi enriquecido
        if (result.creditsUsed === 0) {
          throw new Error('Não há dados novos para enriquecer este lead');
        }
      }

      // 4. Debitar créditos (se não for dev account)
      if (!isDevAccount(user)) {
        const { error: debitError } = await supabase.rpc('debit_credits', {
          p_user_id: user.id,
          p_credits: result.creditsUsed,
          p_operation_type: 'lead_enrichment',
          p_domain: leadData.company_domain || null,
          p_email: leadData.email || null,
          p_query_params: JSON.parse(JSON.stringify({
            lead_id: leadId,
            options: options || {},
          })),
          p_result_summary: JSON.parse(JSON.stringify({
            fields_enriched: Object.keys(result.enrichedData).length,
            sources: result.source,
            confidence: result.confidence || 0,
          })),
        });

        if (debitError) {
          console.error('Erro ao debitar créditos:', debitError);
          // Não lança erro aqui pois o enriquecimento já foi feito
        }
      }

      return result;
    },
    onSuccess: (result, variables) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['userCredits'] });

      // Mostra toast de sucesso com detalhes
      const fieldsCount = Object.keys(result.enrichedData).length;
      const creditsMsg = isDevAccount(user!)
        ? '(Dev Account - FREE)'
        : `${result.creditsUsed} créditos usados`;

      toast.success('Lead Enriquecido com Sucesso! ✨', {
        description: `${fieldsCount} campos atualizados ${creditsMsg}`,
        duration: 5000,
      });

      // Log detalhado
      console.log('✅ Lead enriquecido:', {
        leadId: variables.leadId,
        fieldsEnriched: Object.keys(result.enrichedData),
        creditsUsed: result.creditsUsed,
        sources: result.source,
        confidence: result.confidence,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Erro ao enriquecer lead:', error);
      
      if (error.message.includes('Créditos insuficientes')) {
        toast.error('Créditos Insuficientes', {
          description: error.message,
          duration: 6000,
        });
      } else if (error.message.includes('Não há dados novos')) {
        toast.info('Lead Já Enriquecido', {
          description: 'Este lead já possui todas as informações disponíveis',
          duration: 5000,
        });
      } else if (error.message.includes('Enriquecimento não concluído')) {
        toast.warning('Enriquecimento Parcial', {
          description: 'Alguns dados não puderam ser obtidos. Tente novamente mais tarde.',
          duration: 6000,
        });
      } else {
        toast.error('Erro ao Enriquecer Lead', {
          description: error.message || 'Tente novamente em alguns instantes',
          duration: 5000,
        });
      }
    },
  });
}

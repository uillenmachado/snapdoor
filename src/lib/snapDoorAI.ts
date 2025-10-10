// =====================================================
// SNAPDOOR AI PROSPECTION API - Frontend Integration
// Interface para integração com sistema inteligente de prospecção
// Tecnologia proprietária SnapDoor para descoberta automática de leads
// =====================================================

import { prospectionService, ProspectionFilters, ProspectionResult, EnrichmentResult } from '@/services/smartProspectionService';
import { supabase } from '@/integrations/supabase/client';

export interface AutoProspectionConfig {
  enabled: boolean;
  filters: ProspectionFilters;
  maxLeadsPerRun: number;
  frequency: 'daily' | 'weekly' | 'manual';
  targetStageId: string;
}

export interface ProspectionStatus {
  isRunning: boolean;
  lastRun?: Date;
  totalLeadsCreated: number;
  totalLeadsEnriched: number;
  creditsRemaining: number;
  nextScheduledRun?: Date;
}

class SnapDoorProspectionAPI {
  // ============= PROSPECÇÃO INTELIGENTE =============
  async runSmartProspection(
    filters: ProspectionFilters,
    stageId: string,
    maxLeads: number = 25
  ): Promise<ProspectionResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('[SnapDoor AI] Iniciando prospecção inteligente...');
      
      const result = await prospectionService.runProspection(
        user.id,
        stageId,
        filters,
        maxLeads
      );

      // Notificar usuário do resultado
      if (result.success) {
        this.showSuccessNotification(
          `🎯 IA SnapDoor concluída!`,
          `${result.leadsCreated} novos leads descobertos`
        );
      } else {
        this.showErrorNotification(
          'Erro na descoberta inteligente',
          result.message
        );
      }

      return result;

    } catch (error) {
      console.error('[SnapDoor AI] Falha na prospecção:', error);
      
      this.showErrorNotification(
        'Erro interno',
        'Falha no sistema de descoberta inteligente'
      );

      return {
        success: false,
        leadsCreated: 0,
        leadsEnriched: 0,
        creditsUsed: 0,
        message: 'Erro interno durante prospecção inteligente',
        error: error.message
      };
    }
  }

  // ============= ENRIQUECIMENTO INTELIGENTE =============
  async enrichLeadWithAI(leadId: string): Promise<EnrichmentResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log(`[SnapDoor AI] Enriquecendo lead ${leadId} com inteligência artificial...`);
      
      const result = await prospectionService.enrichLead(leadId, user.id);

      // Notificar resultado
      if (result.success) {
        this.showSuccessNotification(
          '✨ IA SnapDoor ativada!',
          result.message
        );
      } else {
        this.showWarningNotification(
          'Enriquecimento IA',
          result.message
        );
      }

      return result;

    } catch (error) {
      console.error(`[SnapDoor AI] Falha no enriquecimento do lead ${leadId}:`, error);
      
      this.showErrorNotification(
        'Erro no enriquecimento IA',
        'Falha no sistema inteligente'
      );

      return {
        success: false,
        message: 'Erro interno durante enriquecimento inteligente',
        creditsUsed: 0
      };
    }
  }

  // ============= CONFIGURAÇÃO INTELIGENTE =============
  async saveSmartProspectionConfig(config: AutoProspectionConfig): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Por enquanto, salvar em localStorage até termos a coluna no banco
      localStorage.setItem(`snapdoor_ai_config_${user.id}`, JSON.stringify(config));

      this.showSuccessNotification(
        '⚙️ IA SnapDoor configurada!',
        'Sistema inteligente de prospecção ativado'
      );

      return true;

    } catch (error) {
      console.error('[SnapDoor AI] Falha ao salvar configuração:', error);
      
      this.showErrorNotification(
        'Erro na configuração IA',
        'Falha ao configurar sistema inteligente'
      );

      return false;
    }
  }

  async getSmartProspectionConfig(): Promise<AutoProspectionConfig | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Por enquanto, buscar do localStorage
      const stored = localStorage.getItem(`snapdoor_ai_config_${user.id}`);
      if (!stored) return null;

      return JSON.parse(stored) as AutoProspectionConfig;

    } catch (error) {
      console.error('[SnapDoor AI] Falha ao buscar configuração:', error);
      return null;
    }
  }

  // ============= STATUS DO SISTEMA INTELIGENTE =============
  async getSmartProspectionStatus(): Promise<ProspectionStatus> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar estatísticas de prospecção IA
      const { data: stats } = await supabase
        .from('leads')
        .select('id, created_at, custom_fields')
        .eq('user_id', user.id)
        .eq('source', 'prospection');

      const totalLeadsCreated = stats?.length || 0;
      const totalLeadsEnriched = stats?.filter(
        lead => {
          const customFields = lead.custom_fields as any;
          return customFields?.enrichment_status === 'enriched';
        }
      ).length || 0;

      // Buscar última execução da IA
      const lastRun = stats?.length > 0 
        ? new Date(Math.max(...stats.map(s => new Date(s.created_at).getTime())))
        : undefined;

      // Créditos IA (implementar lógica real depois)
      const creditsRemaining = 100;

      return {
        isRunning: false, // TODO: implementar controle de jobs IA em execução
        lastRun,
        totalLeadsCreated,
        totalLeadsEnriched,
        creditsRemaining,
        nextScheduledRun: undefined // TODO: implementar agendamento IA
      };

    } catch (error) {
      console.error('[SnapDoor AI] Falha ao buscar status:', error);
      
      return {
        isRunning: false,
        totalLeadsCreated: 0,
        totalLeadsEnriched: 0,
        creditsRemaining: 0
      };
    }
  }

  // ============= BUSCA INTELIGENTE DE EMPRESAS =============
  async searchCompaniesWithAI(query: string, filters?: Partial<ProspectionFilters>): Promise<any[]> {
    try {
      // Esta seria uma feature para sugerir empresas antes de prospectá-las usando IA
      // Por enquanto retorna array vazio
      console.log(`[SnapDoor AI] Pesquisando empresas com IA: ${query}`, filters);
      return [];

    } catch (error) {
      console.error('[SnapDoor AI] Falha na busca inteligente:', error);
      return [];
    }
  }

  // ============= ANÁLISE INTELIGENTE DE PROSPECTION =============
  async getSmartProspectionAnalytics(days: number = 30): Promise<{
    totalRuns: number;
    successRate: number;
    averageLeadsPerRun: number;
    enrichmentRate: number;
    aiCreditsUsage: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: leads } = await supabase
        .from('leads')
        .select('created_at, custom_fields')
        .eq('user_id', user.id)
        .eq('source', 'prospection')
        .gte('created_at', startDate.toISOString());

      const totalLeads = leads?.length || 0;
      const enrichedLeads = leads?.filter(
        lead => {
          const customFields = lead.custom_fields as any;
          return customFields?.enrichment_status === 'enriched';
        }
      ).length || 0;

      return {
        totalRuns: 1, // TODO: contar execuções IA reais
        successRate: totalLeads > 0 ? 100 : 0,
        averageLeadsPerRun: totalLeads,
        enrichmentRate: totalLeads > 0 ? (enrichedLeads / totalLeads) * 100 : 0,
        aiCreditsUsage: totalLeads * 2 // Estimativa de créditos IA
      };

    } catch (error) {
      console.error('[SnapDoor AI] Falha na análise inteligente:', error);
      
      return {
        totalRuns: 0,
        successRate: 0,
        averageLeadsPerRun: 0,
        enrichmentRate: 0,
        aiCreditsUsage: 0
      };
    }
  }

  // ============= HELPERS DE NOTIFICAÇÃO =============
  private showSuccessNotification(title: string, message: string) {
    // Integração com sistema de toast/notificações do projeto
    console.log(`✅ ${title}: ${message}`);
    
    // Se existir sistema de toast, usar aqui
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'success', title, message }
      }));
    }
  }

  private showErrorNotification(title: string, message: string) {
    console.error(`❌ ${title}: ${message}`);
    
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'error', title, message }
      }));
    }
  }

  private showWarningNotification(title: string, message: string) {
    console.warn(`⚠️ ${title}: ${message}`);
    
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('notification', {
        detail: { type: 'warning', title, message }
      }));
    }
  }
}

// Export singleton
export const snapDoorAI = new SnapDoorProspectionAPI();

// Export types
export type { ProspectionFilters, ProspectionResult, EnrichmentResult };
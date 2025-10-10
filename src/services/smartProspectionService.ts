// =====================================================
// SNAPDOOR PROSPECTION SERVICE - Automated Lead Discovery
// Sistema inteligente de prospecção e enriquecimento de leads
// Tecnologia proprietária SnapDoor para descoberta automática
// =====================================================

import { getLeadDiscoveryService } from './leadDiscoveryService';
import { supabase } from '@/integrations/supabase/client';

interface ProspectionFilters {
  industry?: string;
  country?: string; 
  city?: string;
  companySizeMin?: number;
  companySizeMax?: number;
  keywords?: string[];
}

interface ProspectionResult {
  success: boolean;
  leadsCreated: number;
  leadsEnriched: number;
  creditsUsed: number;
  message: string;
  error?: string;
}

interface EnrichmentResult {
  success: boolean;
  message: string;
  creditsUsed: number;
  data?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    position?: string;
    linkedin?: string;
    emailVerified?: boolean;
  };
}

class ProspectionService {
  private discoveryService = getLeadDiscoveryService();

  async runProspection(
    userId: string,
    stageId: string, 
    filters: ProspectionFilters,
    maxLeads: number = 25
  ): Promise<ProspectionResult> {
    console.log(`[SnapDoor AI] Iniciando prospecção inteligente para usuário ${userId}`);
    
    let creditsUsed = 0;
    let leadsCreated = 0;
    let leadsEnriched = 0;

    try {
      // Verificar se usuário tem créditos suficientes
      const estimatedCredits = this.discoveryService.estimateCredits({ 
        type: 'company', 
        industry: filters.industry,
        country: filters.country,
        city: filters.city,
        company_size_min: filters.companySizeMin,
        company_size_max: filters.companySizeMax,
        limit: maxLeads
      }, maxLeads);
      
      const hasCredits = await this.checkUserCredits(userId, estimatedCredits);
      
      if (!hasCredits) {
        return {
          success: false,
          leadsCreated: 0,
          leadsEnriched: 0,
          creditsUsed: 0,
          message: 'Créditos insuficientes para esta prospecção',
          error: 'insufficient_credits'
        };
      }

      // 1. Descobrir empresas usando SnapDoor Discovery AI
      console.log('[SnapDoor AI] Analisando mercado e descobrindo empresas...');
      const companies = await this.discoveryService.discover({
        type: 'company',
        industry: filters.industry,
        country: filters.country || 'BR',
        city: filters.city,
        company_size_min: filters.companySizeMin,
        company_size_max: filters.companySizeMax,
        limit: maxLeads,
        keywords: filters.keywords
      });
      
      creditsUsed += 1; // Discovery usa 1 crédito
      console.log(`[SnapDoor AI] ${companies.length} empresas identificadas pela IA`);

      if (companies.length === 0) {
        await this.debitCredits(userId, creditsUsed);
        return {
          success: true,
          leadsCreated: 0,
          leadsEnriched: 0,
          creditsUsed,
          message: 'Nenhuma empresa encontrada com os filtros especificados'
        };
      }

      // 2. Para cada empresa, criar lead e tentar enriquecer
      for (const company of companies) {
        try {
          // Verificar se lead já existe pelo domínio
          const existingLead = await this.findExistingLead(userId, company.domain);
          if (existingLead) {
            console.log(`[SnapDoor AI] Lead já existe para ${company.domain}`);
            continue;
          }

          // Criar lead básico
          const leadData = {
            user_id: userId,
            stage_id: stageId,
            first_name: company.company_name,
            last_name: '',
            company: company.company_name,
            job_title: '',
            email: '',
            phone: '',
            linkedin_url: '',
            tags: ['prospect', 'ai-discovered'],
            custom_fields: {
              domain: company.domain,
              industry: company.industry,
              country: company.country,
              city: company.city,
              company_size: company.company_size,
              revenue: company.revenue,
              source: 'snapdoor_ai',
              discovery_date: new Date().toISOString(),
              enrichment_status: 'pending'
            },
            source: 'prospection',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: newLead, error: leadError } = await supabase
            .from('leads')
            .insert(leadData)
            .select()
            .single();

          if (leadError || !newLead) {
            console.error(`[SnapDoor AI] Falha ao criar lead para ${company.company_name}:`, leadError);
            continue;
          }

          leadsCreated++;
          console.log(`[SnapDoor AI] Lead criado: ${company.company_name}`);

          // 3. Tentar enriquecer com emails usando SnapDoor AI
          if (company.domain) {
            try {
              console.log(`[SnapDoor AI] Enriquecendo lead com dados de contato: ${company.domain}`);
              const domainData = await this.discoveryService.domainSearch(company.domain, 3);
              creditsUsed += 1; // Domain search usa 1 crédito

              if (domainData && domainData.emails.length > 0) {
                const primaryEmail = domainData.emails[0];
                
                // Atualizar lead com dados enriquecidos
                const enrichedData = {
                  first_name: primaryEmail.first_name || company.company_name,
                  last_name: primaryEmail.last_name || '',
                  email: primaryEmail.value,
                  job_title: primaryEmail.position || '',
                  linkedin_url: primaryEmail.linkedin || '',
                  custom_fields: {
                    ...leadData.custom_fields,
                    enrichment_status: 'enriched',
                    email_confidence: primaryEmail.confidence,
                    enriched_at: new Date().toISOString(),
                    alternative_emails: domainData.emails.slice(1, 3).map(e => e.value)
                  },
                  updated_at: new Date().toISOString()
                };

                await supabase
                  .from('leads')
                  .update(enrichedData)
                  .eq('id', newLead.id);

                leadsEnriched++;
                console.log(`[SnapDoor AI] Lead enriquecido: ${primaryEmail.value}`);

                // Log enriquecimento
                await this.logEnrichment(newLead.id, 'ai-domain-analysis', 1, true);
              } else {
                // Marcar como não enriquecido
                await supabase
                  .from('leads')
                  .update({
                    custom_fields: {
                      ...leadData.custom_fields,
                      enrichment_status: 'no_emails_found'
                    }
                  })
                  .eq('id', newLead.id);
              }

            } catch (enrichError) {
              console.error(`[SnapDoor AI] Enriquecimento falhou para ${company.domain}:`, enrichError);
              await this.logEnrichment(newLead.id, 'ai-domain-analysis', 1, false, enrichError.message);
            }
          }

          // Pequena pausa para não sobrecarregar o sistema
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.error(`[SnapDoor AI] Erro ao processar ${company.company_name}:`, error);
        }
      }

      // Debitar créditos utilizados
      await this.debitCredits(userId, creditsUsed);

      // Log da prospecção
      await this.logProspection(userId, {
        filters,
        leads_created: leadsCreated,
        leads_enriched: leadsEnriched,
        credits_used: creditsUsed
      });

      return {
        success: true,
        leadsCreated,
        leadsEnriched,
        creditsUsed,
        message: `Prospecção IA concluída! ${leadsCreated} leads descobertos, ${leadsEnriched} enriquecidos.`
      };

    } catch (error) {
      console.error('[SnapDoor AI] Erro crítico:', error);
      
      // Tentar reembolsar créditos em caso de erro
      if (creditsUsed > 0) {
        await this.refundCredits(userId, creditsUsed);
      }

      return {
        success: false,
        leadsCreated,
        leadsEnriched,
        creditsUsed: 0,
        message: 'Erro durante a prospecção inteligente',
        error: error.message
      };
    }
  }

  async enrichLead(leadId: string, userId: string): Promise<EnrichmentResult> {
    console.log(`[SnapDoor AI] Iniciando enriquecimento inteligente para lead ${leadId}`);

    try {
      // Buscar lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('user_id', userId)
        .single();

      if (leadError || !lead) {
        return {
          success: false,
          message: 'Lead não encontrado',
          creditsUsed: 0
        };
      }

      // Verificar se já foi enriquecido recentemente
      const customFields = lead.custom_fields as any;
      const enrichedAt = customFields?.enriched_at;
      if (enrichedAt) {
        const enrichedDate = new Date(enrichedAt);
        const hoursSinceEnrichment = (Date.now() - enrichedDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceEnrichment < 24) {
          return {
            success: false,
            message: 'Lead já foi enriquecido pela IA nas últimas 24 horas',
            creditsUsed: 0
          };
        }
      }

      let creditsUsed = 0;
      let enrichmentData: any = {};

      // Tentar diferentes estratégias de enriquecimento usando SnapDoor AI
      const domain = customFields?.domain || this.extractDomainFromCompany(lead.company);

      if (domain) {
        // 1. Análise de domínio se não temos email
        if (!lead.email) {
          console.log(`[SnapDoor AI] Analisando domínio: ${domain}`);
          const domainData = await this.discoveryService.domainSearch(domain, 5);
          creditsUsed += 1;

          if (domainData && domainData.emails.length > 0) {
            const primaryEmail = domainData.emails[0];
            enrichmentData = {
              email: primaryEmail.value,
              first_name: primaryEmail.first_name || lead.first_name,
              last_name: primaryEmail.last_name || lead.last_name,
              job_title: primaryEmail.position || lead.job_title,
              linkedin_url: primaryEmail.linkedin || lead.linkedin_url
            };
          }
        }

        // 2. Busca inteligente de email se temos nome mas não email
        if (!enrichmentData.email && lead.first_name && lead.last_name) {
          console.log(`[SnapDoor AI] Procurando email: ${lead.first_name} ${lead.last_name} @ ${domain}`);
          const emailData = await this.discoveryService.emailFinder(domain, lead.first_name, lead.last_name);
          creditsUsed += 1;

          if (emailData) {
            enrichmentData = {
              ...enrichmentData,
              email: emailData.value,
              job_title: emailData.position || enrichmentData.job_title,
              linkedin_url: emailData.linkedin || enrichmentData.linkedin_url
            };
          }
        }

        // 3. Verificar email se encontramos um
        if (enrichmentData.email) {
          console.log(`[SnapDoor AI] Verificando email: ${enrichmentData.email}`);
          const verification = await this.discoveryService.emailVerifier(enrichmentData.email);
          // Email verification é gratuita
          
          if (verification) {
            enrichmentData.emailVerified = verification.result === 'deliverable';
          }
        }
      }

      // Verificar se usuário tem créditos
      if (creditsUsed > 0) {
        const hasCredits = await this.checkUserCredits(userId, creditsUsed);
        if (!hasCredits) {
          return {
            success: false,
            message: 'Créditos insuficientes para enriquecimento IA',
            creditsUsed: 0
          };
        }
      }

      // Atualizar lead se encontramos dados
      if (Object.keys(enrichmentData).length > 0) {
        const updateData = {
          ...enrichmentData,
          custom_fields: {
            ...customFields,
            enrichment_status: 'enriched',
            enriched_at: new Date().toISOString(),
            last_enrichment_credits: creditsUsed
          },
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('leads')
          .update(updateData)
          .eq('id', leadId);

        // Debitar créditos
        if (creditsUsed > 0) {
          await this.debitCredits(userId, creditsUsed);
        }

        // Log enriquecimento
        await this.logEnrichment(leadId, 'ai-manual-enrichment', creditsUsed, true);

        return {
          success: true,
          message: `Lead enriquecido pela IA SnapDoor! ${creditsUsed} crédito(s) utilizado(s).`,
          creditsUsed,
          data: enrichmentData
        };
      } else {
        return {
          success: false,
          message: 'IA não conseguiu encontrar dados adicionais para este lead',
          creditsUsed: 0
        };
      }

    } catch (error) {
      console.error(`[SnapDoor AI] Erro no enriquecimento do lead ${leadId}:`, error);
      return {
        success: false,
        message: 'Erro interno durante enriquecimento inteligente',
        creditsUsed: 0
      };
    }
  }

  // Métodos auxiliares
  private async findExistingLead(userId: string, domain: string) {
    const { data } = await supabase
      .from('leads')
      .select('id')
      .eq('user_id', userId)
      .or(`custom_fields->>domain.eq.${domain}`)
      .limit(1)
      .single();
    
    return data;
  }

  private async checkUserCredits(userId: string, needed: number): Promise<boolean> {
    // Por enquanto, sempre retornar true
    // Em produção, implementar lógica real de créditos
    return true;
  }

  private async debitCredits(userId: string, amount: number): Promise<void> {
    // Por enquanto, apenas log
    console.log(`[SnapDoor AI] Debitando ${amount} créditos do usuário ${userId}`);
  }

  private async refundCredits(userId: string, amount: number): Promise<void> {
    console.log(`[SnapDoor AI] Reembolsando ${amount} créditos para usuário ${userId}`);
  }

  private async logEnrichment(leadId: string, type: string, credits: number, success: boolean, error?: string): Promise<void> {
    // Log para auditoria
    console.log(`[SnapDoor AI] Log enriquecimento ${leadId}: ${type}, ${credits} créditos, sucesso: ${success}`, error || '');
  }

  private async logProspection(userId: string, data: any): Promise<void> {
    console.log(`[SnapDoor AI] Log prospecção usuário ${userId}:`, data);
  }

  private extractDomainFromCompany(companyName: string): string | null {
    if (!companyName) return null;
    
    // Heurística simples para extrair domínio do nome da empresa
    const cleaned = companyName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    return `${cleaned}.com`;
  }
}

export const prospectionService = new ProspectionService();
export type { ProspectionFilters, ProspectionResult, EnrichmentResult };
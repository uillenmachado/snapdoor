// =====================================================
// LEAD ENRICHMENT SERVICE
// Enriquece leads com informações da API Hunter.io
// =====================================================

import { hunterClient, CREDIT_COSTS } from './hunterClient';
import { supabase } from '@/integrations/supabase/client';

export interface EnrichmentResult {
  success: boolean;
  creditsUsed: number;
  enrichedData: {
    email?: string;
    phone?: string;
    job_title?: string;
    company?: string;
    company_domain?: string;
    linkedin_url?: string;
    twitter_url?: string;
    seniority?: string;
    department?: string;
    // Company info
    company_size?: number;
    company_industry?: string;
    company_location?: string;
    company_logo?: string;
  };
  source: string;
  confidence?: number;
}

export interface EnrichmentOptions {
  findEmail?: boolean;
  verifyEmail?: boolean;
  enrichCompany?: boolean;
  enrichPerson?: boolean;
}

class LeadEnrichmentService {
  /**
   * Enriquece um lead com informações disponíveis
   * Estratégia inteligente baseada nos dados que já temos
   */
  async enrichLead(
    leadId: string,
    currentData: {
      first_name?: string;
      last_name?: string;
      email?: string;
      company?: string;
      company_domain?: string;
    },
    options: EnrichmentOptions = {
      findEmail: true,
      verifyEmail: true,
      enrichCompany: true,
      enrichPerson: true,
    }
  ): Promise<EnrichmentResult> {
    try {
      let enrichedData: any = {};
      let totalCredits = 0;
      let confidence = 0;
      const sources: string[] = [];

      // 1. Se temos nome + empresa, mas não temos email - tenta encontrar email
      if (
        options.findEmail &&
        currentData.first_name &&
        currentData.last_name &&
        currentData.company_domain &&
        !currentData.email
      ) {
        try {
          console.log(`🔍 Buscando email para ${currentData.first_name} ${currentData.last_name} @ ${currentData.company_domain}`);
          
          const emailResult = await hunterClient.emailFinder(
            currentData.company_domain,
            currentData.first_name,
            currentData.last_name
          );

          if (emailResult?.email) {
            enrichedData.email = emailResult.email;
            enrichedData.job_title = emailResult.position || enrichedData.job_title;
            enrichedData.linkedin_url = emailResult.linkedin || enrichedData.linkedin_url;
            enrichedData.twitter_url = emailResult.twitter || enrichedData.twitter_url;
            enrichedData.company = emailResult.company || enrichedData.company;
            confidence = Math.max(confidence, emailResult.score || 0);
            totalCredits += CREDIT_COSTS.EMAIL_FINDER;
            sources.push('email_finder');
            console.log(`✅ Email encontrado: ${emailResult.email} (score: ${emailResult.score})`);
          }
        } catch (error) {
          console.warn('Email finder não encontrou resultados:', error);
        }
      }

      // 2. Se temos email - enriquece informações da pessoa
      if (options.enrichPerson && (currentData.email || enrichedData.email)) {
        try {
          const emailToUse = enrichedData.email || currentData.email!;
          console.log(`🔍 Enriquecendo informações da pessoa: ${emailToUse}`);
          
          const personResult = await hunterClient.personEnrichment(emailToUse);

          if (personResult) {
            enrichedData.job_title = personResult.position || enrichedData.job_title;
            enrichedData.phone = personResult.phone_number || enrichedData.phone;
            enrichedData.linkedin_url = personResult.linkedin || enrichedData.linkedin_url;
            enrichedData.twitter_url = personResult.twitter || enrichedData.twitter_url;
            enrichedData.seniority = personResult.seniority || enrichedData.seniority;
            enrichedData.department = personResult.department || enrichedData.department;
            enrichedData.company = personResult.company || enrichedData.company;
            totalCredits += CREDIT_COSTS.PERSON_ENRICHMENT;
            sources.push('person_enrichment');
            console.log(`✅ Pessoa enriquecida: ${personResult.position || 'N/A'}`);
          }
        } catch (error) {
          console.warn('Person enrichment não encontrou resultados:', error);
        }
      }

      // 3. Se temos domínio da empresa - enriquece informações da empresa
      if (options.enrichCompany && currentData.company_domain) {
        try {
          console.log(`🔍 Enriquecendo informações da empresa: ${currentData.company_domain}`);
          
          const companyResult = await hunterClient.companyEnrichment(currentData.company_domain);

          if (companyResult) {
            enrichedData.company = companyResult.name || enrichedData.company;
            enrichedData.company_size = companyResult.employees || enrichedData.company_size;
            enrichedData.company_industry = companyResult.industry || enrichedData.company_industry;
            enrichedData.company_location = 
              [companyResult.city, companyResult.state, companyResult.country]
                .filter(Boolean)
                .join(', ') || enrichedData.company_location;
            enrichedData.company_logo = companyResult.logo || enrichedData.company_logo;
            enrichedData.phone = companyResult.phone_number || enrichedData.phone;
            enrichedData.linkedin_url = companyResult.linkedin_url || enrichedData.linkedin_url;
            enrichedData.twitter_url = companyResult.twitter || enrichedData.twitter_url;
            totalCredits += CREDIT_COSTS.COMPANY_ENRICHMENT;
            sources.push('company_enrichment');
            console.log(`✅ Empresa enriquecida: ${companyResult.name || 'N/A'}`);
          }
        } catch (error) {
          console.warn('Company enrichment não encontrou resultados:', error);
        }
      }

      // 4. Se verificação de email está habilitada e temos email
      if (options.verifyEmail && (currentData.email || enrichedData.email)) {
        try {
          const emailToVerify = enrichedData.email || currentData.email!;
          console.log(`🔍 Verificando email: ${emailToVerify}`);
          
          const verifyResult = await hunterClient.emailVerifier(emailToVerify);

          if (verifyResult) {
            // Atualiza confidence baseado na verificação
            if (verifyResult.result === 'deliverable') {
              confidence = Math.max(confidence, verifyResult.score || 0);
            }
            totalCredits += CREDIT_COSTS.EMAIL_VERIFIER;
            sources.push('email_verifier');
            console.log(`✅ Email verificado: ${verifyResult.result} (score: ${verifyResult.score})`);
          }
        } catch (error) {
          console.warn('Email verification falhou:', error);
        }
      }

      // Se não encontramos nada novo
      if (Object.keys(enrichedData).length === 0) {
        return {
          success: false,
          creditsUsed: 0,
          enrichedData: {},
          source: 'none',
          confidence: 0,
        };
      }

      // Atualiza o lead no banco de dados
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          ...enrichedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      if (updateError) {
        console.error('Erro ao atualizar lead:', updateError);
        throw updateError;
      }

      console.log(`✅ Lead enriquecido com sucesso! ${totalCredits} créditos usados`);
      console.log('Fontes usadas:', sources.join(', '));

      return {
        success: true,
        creditsUsed: totalCredits,
        enrichedData,
        source: sources.join(', '),
        confidence: Math.round(confidence),
      };
    } catch (error) {
      console.error('Erro ao enriquecer lead:', error);
      throw error;
    }
  }

  /**
   * Calcula quantos créditos serão necessários para enriquecer um lead
   */
  calculateCreditsNeeded(
    currentData: {
      first_name?: string;
      last_name?: string;
      email?: string;
      company?: string;
      company_domain?: string;
    },
    options: EnrichmentOptions = {
      findEmail: true,
      verifyEmail: true,
      enrichCompany: true,
      enrichPerson: true,
    }
  ): { total: number; breakdown: Record<string, number> } {
    let total = 0;
    const breakdown: Record<string, number> = {};

    // Email Finder (se não tem email mas tem nome + empresa)
    if (
      options.findEmail &&
      currentData.first_name &&
      currentData.last_name &&
      currentData.company_domain &&
      !currentData.email
    ) {
      breakdown['Email Finder'] = CREDIT_COSTS.EMAIL_FINDER;
      total += CREDIT_COSTS.EMAIL_FINDER;
    }

    // Person Enrichment (se tem email)
    if (options.enrichPerson && currentData.email) {
      breakdown['Person Enrichment'] = CREDIT_COSTS.PERSON_ENRICHMENT;
      total += CREDIT_COSTS.PERSON_ENRICHMENT;
    }

    // Company Enrichment (se tem domínio)
    if (options.enrichCompany && currentData.company_domain) {
      breakdown['Company Enrichment'] = CREDIT_COSTS.COMPANY_ENRICHMENT;
      total += CREDIT_COSTS.COMPANY_ENRICHMENT;
    }

    // Email Verifier (se tem email)
    if (options.verifyEmail && currentData.email) {
      breakdown['Email Verifier'] = CREDIT_COSTS.EMAIL_VERIFIER;
      total += CREDIT_COSTS.EMAIL_VERIFIER;
    }

    return { total, breakdown };
  }

  /**
   * Extrai domínio de um nome de empresa
   */
  extractDomainFromCompany(company: string): string | null {
    try {
      // Remove espaços e converte para lowercase
      const cleaned = company.trim().toLowerCase();
      
      // Remove palavras comuns
      const cleaned2 = cleaned
        .replace(/\s+(ltda|ltd|inc|corp|corporation|company|co|sa|s\.a\.|me|llc)\.?$/i, '')
        .trim();
      
      // Substitui espaços por hífens
      const domain = cleaned2.replace(/\s+/g, '-');
      
      // Adiciona .com se não tiver extensão
      return domain.includes('.') ? domain : `${domain}.com`;
    } catch (error) {
      console.error('Erro ao extrair domínio:', error);
      return null;
    }
  }
}

// Export singleton
export const leadEnrichmentService = new LeadEnrichmentService();
export default leadEnrichmentService;

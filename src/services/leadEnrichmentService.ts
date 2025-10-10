// =====================================================
// LEAD ENRICHMENT SERVICE
// Enriquece leads com informações da API Hunter.io
// + Fallback com LinkedIn Scraper para perfis públicos
// =====================================================

import { hunterClient, CREDIT_COSTS } from './hunterClient';
import { linkedInScraperService } from './linkedinScraperService';
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
      linkedin_url?: string;
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

      // Se não temos company_domain mas temos company, tenta extrair
      let workingDomain = currentData.company_domain;
      if (!workingDomain && currentData.company) {
        workingDomain = this.extractDomainFromCompany(currentData.company);
        console.log(`🔍 Domínio extraído da empresa "${currentData.company}": ${workingDomain}`);
      }

      console.log(`📊 Dados disponíveis para enriquecimento:`, {
        first_name: !!currentData.first_name,
        last_name: !!currentData.last_name,
        email: !!currentData.email,
        company: !!currentData.company,
        company_domain: !!workingDomain,
      });

      // 1. Se temos nome + empresa, mas não temos email - tenta encontrar email
      if (
        options.findEmail &&
        currentData.first_name &&
        currentData.last_name &&
        workingDomain &&
        !currentData.email
      ) {
        try {
          console.log(`🔍 Buscando email para ${currentData.first_name} ${currentData.last_name} @ ${workingDomain}`);
          
          const emailResult = await hunterClient.emailFinder(
            workingDomain,
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

      // 2. Se temos email OU LinkedIn - enriquece informações da pessoa
      if (options.enrichPerson && (currentData.email || enrichedData.email || currentData.linkedin_url)) {
        let personResult = null;
        
        // Tenta primeiro com Email (mais confiável)
        if (enrichedData.email || currentData.email) {
          try {
            const email = enrichedData.email || currentData.email!;
            console.log(`🔍 Enriquecendo informações da pessoa via Email: ${email}`);
            personResult = await hunterClient.personEnrichment(email);
            
            if (personResult) {
              console.log(`✅ Pessoa enriquecida via Email: ${personResult.position || 'N/A'}`);
            }
          } catch (error) {
            console.warn('❌ Email enrichment falhou:', error);
            // Continua para tentar LinkedIn
          }
        }
        
        // Se falhou com email, tenta com LinkedIn via Hunter.io
        if (!personResult && currentData.linkedin_url) {
          try {
            console.log(`🔄 Tentando enriquecer via LinkedIn (Hunter.io): ${currentData.linkedin_url}`);
            personResult = await hunterClient.personEnrichment(currentData.linkedin_url);
            
            if (personResult) {
              console.log(`✅ Pessoa enriquecida via LinkedIn (Hunter.io): ${personResult.position || 'N/A'}`);
            }
          } catch (error) {
            console.warn('❌ LinkedIn enrichment (Hunter.io) também falhou:', error);
          }
        }
        
        // ÚLTIMO FALLBACK: Se Hunter.io falhou completamente, extrai dados públicos do LinkedIn
        if (!personResult && currentData.linkedin_url) {
          try {
            console.log(`🌐 FALLBACK: Extraindo dados públicos do LinkedIn: ${currentData.linkedin_url}`);
            const linkedInData = await linkedInScraperService.extractProfileData(currentData.linkedin_url);
            
            if (linkedInData) {
              // Preenche com dados extraídos do perfil público (ORGANIZADO)
              enrichedData.first_name = linkedInData.firstName || enrichedData.first_name;
              enrichedData.last_name = linkedInData.lastName || enrichedData.last_name;
              enrichedData.full_name = linkedInData.fullName || enrichedData.full_name;
              
              // Cargo e Empresa separados corretamente
              enrichedData.job_title = linkedInData.position || enrichedData.job_title;
              enrichedData.company = linkedInData.company || enrichedData.company;
              
              // Localização, Educação, Conexões
              enrichedData.location = linkedInData.location || enrichedData.location;
              enrichedData.education = linkedInData.education || enrichedData.education;
              enrichedData.connections = linkedInData.connections || enrichedData.connections;
              
              // Headline (resumo curto do cargo)
              enrichedData.headline = linkedInData.headline || enrichedData.headline;
              
              // About (sobre completo do perfil) - salvo em campo separado
              if (linkedInData.about) {
                enrichedData.about = linkedInData.about;
              }
              
              // Avatar
              if (linkedInData.imageUrl) {
                enrichedData.avatar_url = linkedInData.imageUrl;
              }
              
              enrichedData.linkedin_url = linkedInData.profileUrl;
              
              // NÃO cobra créditos pois é scraping público
              sources.push('linkedin_scraper');
              
              console.log(`✅ Dados extraídos do perfil público do LinkedIn: ${linkedInData.fullName} - ${linkedInData.position || 'Cargo não informado'}`);
              console.log(`   📍 Local: ${linkedInData.location || 'N/A'}`);
              console.log(`   🏢 Empresa: ${linkedInData.company || 'N/A'}`);
              console.log(`   🎓 Educação: ${linkedInData.education || 'N/A'}`);
              console.log(`   👥 Conexões: ${linkedInData.connections || 'N/A'}`);
            }
          } catch (error) {
            console.warn('❌ LinkedIn scraper também falhou:', error);
          }
        }
        
        // Aplica os dados se conseguiu enriquecer por qualquer método (Hunter.io)
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
        }
      }

      // 3. Se temos domínio da empresa - enriquece informações da empresa
      if (options.enrichCompany && workingDomain) {
        try {
          console.log(`🔍 Enriquecendo informações da empresa: ${workingDomain}`);
          
          const companyResult = await hunterClient.companyEnrichment(workingDomain);

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
        // Fornece feedback sobre o que está faltando
        const missingInfo: string[] = [];
        
        if (!currentData.email && (!currentData.first_name || !currentData.last_name || !workingDomain)) {
          missingInfo.push('Para buscar email: primeiro nome + sobrenome + empresa');
        }
        if (!currentData.email) {
          missingInfo.push('Para enriquecer pessoa: email');
        }
        if (!workingDomain && !currentData.company) {
          missingInfo.push('Para enriquecer empresa: nome da empresa ou domínio');
        }
        
        console.warn('❌ Enriquecimento não possível. Faltam:', missingInfo);
        
        return {
          success: false,
          creditsUsed: 0,
          enrichedData: {},
          source: 'insufficient_data',
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
      linkedin_url?: string;
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
   * Exemplos:
   * "Microsoft Corporation" → "microsoft.com"
   * "Google LLC" → "google.com"
   * "Stripe Inc." → "stripe.com"
   * "Nubank S.A." → "nubank.com.br"
   */
  extractDomainFromCompany(company: string): string | null {
    try {
      if (!company || company.trim().length === 0) return null;
      
      // Remove espaços e converte para lowercase
      let cleaned = company.trim().toLowerCase();
      
      // Remove palavras comuns de sufixo corporativo
      const corporateSuffixes = [
        'ltda', 'ltd', 'limited',
        'inc', 'incorporated',
        'corp', 'corporation',
        'company', 'co',
        'sa', 's.a.', 's/a',
        'me', 'mei',
        'llc', 'l.l.c.',
        'eireli',
        'group', 'grupo',
        'holding',
        'internacional', 'international',
        'brasil', 'brazil',
      ];
      
      // Regex para remover sufixos (com ou sem pontos)
      const suffixPattern = new RegExp(
        `\\s+(${corporateSuffixes.join('|')})(\\.)?$`,
        'gi'
      );
      cleaned = cleaned.replace(suffixPattern, '').trim();
      
      // Remove caracteres especiais exceto letras, números e hífens
      cleaned = cleaned.replace(/[^a-z0-9\s-]/g, '');
      
      // Substitui múltiplos espaços por um único hífen
      cleaned = cleaned.replace(/\s+/g, '-');
      
      // Remove hífens consecutivos
      cleaned = cleaned.replace(/-+/g, '-');
      
      // Remove hífens no início e fim
      cleaned = cleaned.replace(/^-+|-+$/g, '');
      
      if (cleaned.length === 0) return null;
      
      // Para empresas brasileiras conhecidas, adiciona .com.br
      const brazilianCompanies = ['nubank', 'bradesco', 'itau', 'santander', 'caixa', 'bb', 'magazine-luiza', 'magalu'];
      if (brazilianCompanies.some(br => cleaned.includes(br))) {
        return cleaned.includes('.') ? cleaned : `${cleaned}.com.br`;
      }
      
      // Para outras, adiciona .com
      return cleaned.includes('.') ? cleaned : `${cleaned}.com`;
    } catch (error) {
      console.error('Erro ao extrair domínio:', error);
      return null;
    }
  }
}

// Export singleton
export const leadEnrichmentService = new LeadEnrichmentService();
export default leadEnrichmentService;

// =====================================================
// SNAPDOOR LEAD DISCOVERY SERVICE
// Sistema inteligente de descoberta e enriquecimento de leads
// =====================================================

// Utility function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DiscoveryFilters {
  type: 'company' | 'person';
  industry?: string;
  country?: string;
  city?: string;
  company_size_min?: number;
  company_size_max?: number;
  limit?: number;
  keywords?: string[];
}

interface CompanyResult {
  company_name: string;
  domain: string;
  industry: string;
  country: string;
  city?: string;
  company_size?: number;
  revenue?: string;
  description?: string;
}

interface EmailResult {
  value: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  linkedin?: string;
  confidence: number;
  verified?: boolean;
}

interface DomainSearchResult {
  domain: string;
  emails: EmailResult[];
  total_emails: number;
}

interface EmailFinderResult {
  value: string;
  confidence: number;
  first_name?: string;
  last_name?: string;
  position?: string;
  linkedin?: string;
  verified?: boolean;
}

interface EmailVerificationResult {
  email: string;
  result: 'deliverable' | 'undeliverable' | 'risky' | 'unknown';
  score: number;
  valid: boolean;
}

class LeadDiscoveryService {
  private static instance: LeadDiscoveryService;
  private baseUrl = 'https://api.hunter.io/v2';
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private lastRequestTime = 0;
  private requestDelay = 60000; // 60 segundos entre requests
  private cacheExpiration = 3600000; // 1 hora

  private constructor() {
    // Buscar API key das variáveis de ambiente ou usar a do hunterClient
    this.apiKey = import.meta.env.VITE_DISCOVERY_API_KEY || 'c2e0acf158a10a3c0253b49c006a80979679cc5c';
    
    if (!this.apiKey) {
      console.warn('[SnapDoor Discovery] API key não configurada. Funcionalidade limitada.');
    } else {
      console.log('[SnapDoor Discovery] API key configurada com sucesso.');
    }
  }

  static getInstance(): LeadDiscoveryService {
    if (!LeadDiscoveryService.instance) {
      LeadDiscoveryService.instance = new LeadDiscoveryService();
    }
    return LeadDiscoveryService.instance;
  }

  // ============= RATE LIMITING =============
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      console.log(`[SnapDoor Discovery] Rate limit: aguardando ${Math.round(waitTime/1000)}s`);
      await sleep(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  // ============= CACHE SYSTEM =============
  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheExpiration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[SnapDoor Discovery] Cache hit: ${key}`);
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // ============= API REQUEST HANDLER =============
  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Sistema de descoberta não configurado');
    }

    const cacheKey = this.getCacheKey(endpoint, params);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    await this.enforceRateLimit();

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    console.log(`[SnapDoor Discovery] Consultando base de dados: ${endpoint}`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'SnapDoor-CRM/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(30000) // 30s timeout
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciais do sistema inválidas');
        }
        if (response.status === 403) {
          throw new Error('Limite de consultas atingido');
        }
        if (response.status === 429) {
          throw new Error('Muitas consultas simultâneas. Tente novamente em alguns minutos');
        }
        throw new Error(`Erro no sistema de descoberta: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        throw new Error(`Erro na consulta: ${data.errors[0].details}`);
      }

      this.setCache(cacheKey, data.data);
      return data.data;

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new Error('Timeout na consulta. Verifique sua conexão');
        }
        if (error.name === 'TypeError') {
          throw new Error('Erro de conexão com o sistema');
        }
      }
      throw error;
    }
  }

  // ============= DESCOBERTA DE EMPRESAS =============
  async discover(filters: DiscoveryFilters): Promise<CompanyResult[]> {
    console.log('[SnapDoor Discovery] Iniciando descoberta de empresas...');
    
    try {
      const params: Record<string, any> = {
        type: filters.type,
        limit: filters.limit || 25
      };

      if (filters.industry) params.industry = filters.industry;
      if (filters.country) params.country = filters.country;
      if (filters.city) params.city = filters.city;
      if (filters.company_size_min) params.company_size_min = filters.company_size_min;
      if (filters.company_size_max) params.company_size_max = filters.company_size_max;

      const result = await this.makeRequest('domain-search', params);
      
      if (!result || !result.data) {
        console.log('[SnapDoor Discovery] Nenhuma empresa encontrada');
        return [];
      }

      const companies = result.data.map((company: any): CompanyResult => ({
        company_name: company.organization || company.company_name || 'Empresa Descoberta',
        domain: company.domain,
        industry: company.industry || filters.industry || 'Diversos',
        country: company.country || filters.country || 'BR',
        city: company.city || filters.city,
        company_size: company.company_size,
        revenue: company.revenue,
        description: company.description
      }));

      console.log(`[SnapDoor Discovery] ${companies.length} empresas descobertas`);
      return companies;

    } catch (error) {
      console.error('[SnapDoor Discovery] Erro na descoberta:', error);
      throw new Error(`Falha na descoberta de empresas: ${error.message}`);
    }
  }

  // ============= BUSCA POR DOMÍNIO =============
  async domainSearch(domain: string, limit: number = 10): Promise<DomainSearchResult | null> {
    console.log(`[SnapDoor Discovery] Analisando domínio: ${domain}`);
    
    try {
      const result = await this.makeRequest('domain-search', {
        domain,
        limit,
        type: 'generic'
      });

      if (!result || !result.emails) {
        return null;
      }

      const emails: EmailResult[] = result.emails.map((email: any) => ({
        value: email.value,
        first_name: email.first_name,
        last_name: email.last_name,
        position: email.position,
        linkedin: email.linkedin,
        confidence: email.confidence || 50,
        verified: email.verification?.result === 'deliverable'
      }));

      return {
        domain,
        emails,
        total_emails: result.meta?.results || emails.length
      };

    } catch (error) {
      console.error(`[SnapDoor Discovery] Erro na análise de ${domain}:`, error);
      return null;
    }
  }

  // ============= ENCONTRAR EMAIL =============
  async emailFinder(domain: string, firstName: string, lastName: string): Promise<EmailFinderResult | null> {
    console.log(`[SnapDoor Discovery] Localizando email: ${firstName} ${lastName} @ ${domain}`);
    
    try {
      const result = await this.makeRequest('email-finder', {
        domain,
        first_name: firstName,
        last_name: lastName
      });

      if (!result || !result.email) {
        return null;
      }

      return {
        value: result.email,
        confidence: result.confidence || 50,
        first_name: result.first_name || firstName,
        last_name: result.last_name || lastName,
        position: result.position,
        linkedin: result.linkedin,
        verified: result.verification?.result === 'deliverable'
      };

    } catch (error) {
      console.error(`[SnapDoor Discovery] Erro ao localizar email:`, error);
      return null;
    }
  }

  // ============= VERIFICAR EMAIL =============
  async emailVerifier(email: string): Promise<EmailVerificationResult | null> {
    console.log(`[SnapDoor Discovery] Verificando email: ${email}`);
    
    try {
      // Verificação de email é gratuita na maioria das APIs
      const result = await this.makeRequest('email-verifier', {
        email
      });

      if (!result) return null;

      return {
        email,
        result: result.result || 'unknown',
        score: result.score || 50,
        valid: result.result === 'deliverable'
      };

    } catch (error) {
      console.error(`[SnapDoor Discovery] Erro na verificação de ${email}:`, error);
      return null;
    }
  }

  // ============= ESTIMATIVA DE CRÉDITOS =============
  estimateCredits(filters: DiscoveryFilters, maxLeads: number): number {
    let credits = 1; // 1 crédito para descoberta inicial
    credits += maxLeads * 1; // 1 crédito por lead para enriquecimento
    return credits;
  }

  // ============= STATUS DO SISTEMA =============
  async getSystemStatus(): Promise<{
    available: boolean;
    credits_remaining?: number;
    calls_available?: number;
    reset_date?: string;
  }> {
    if (!this.apiKey) {
      return { available: false };
    }

    try {
      const result = await this.makeRequest('account', {});
      
      return {
        available: true,
        credits_remaining: result.calls?.available,
        calls_available: result.calls?.available,
        reset_date: result.reset_date
      };

    } catch (error) {
      console.error('[SnapDoor Discovery] Erro ao verificar status:', error);
      return { available: false };
    }
  }

  // ============= CONFIGURAÇÃO =============
  updateApiKey(newApiKey: string): void {
    this.apiKey = newApiKey;
    this.cache.clear(); // Limpar cache ao trocar API key
    console.log('[SnapDoor Discovery] Credenciais atualizadas');
  }

  clearCache(): void {
    this.cache.clear();
    console.log('[SnapDoor Discovery] Cache limpo');
  }
}

// Export singleton instance
export const getLeadDiscoveryService = () => LeadDiscoveryService.getInstance();

// Export types
export type {
  DiscoveryFilters,
  CompanyResult,
  EmailResult,
  DomainSearchResult,
  EmailFinderResult,
  EmailVerificationResult
};
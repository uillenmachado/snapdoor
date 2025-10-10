// =====================================================
// HUNTER.IO API CLIENT - Real Integration
// Sistema de créditos: cobra 3x o custo da API
// =====================================================

// Real Hunter.io API Key
const HUNTER_API_KEY = 'c2e0acf158a10a3c0253b49c006a80979679cc5c';
const HUNTER_BASE_URL = 'https://api.hunter.io/v2';

// Credit costs (how much we charge the client)
export const CREDIT_COSTS = {
  DOMAIN_SEARCH: 3,        // 3 créditos por busca de domínio
  EMAIL_FINDER: 3,         // 3 créditos por busca de email
  EMAIL_VERIFIER: 1,       // 1 crédito por verificação
  COMPANY_ENRICHMENT: 2,   // 2 créditos por enriquecimento de empresa
  PERSON_ENRICHMENT: 2,    // 2 créditos por enriquecimento de pessoa
  COMBINED_ENRICHMENT: 3,  // 3 créditos por enriquecimento combinado
  DISCOVER: 5,             // 5 créditos por discover
};

// Interfaces
export interface DomainSearchOptions {
  limit?: number;
  offset?: number;
  type?: 'personal' | 'generic';
  seniority?: 'junior' | 'senior' | 'executive';
  department?: string;
}

export interface DomainSearchResult {
  domain: string;
  disposable: boolean;
  webmail: boolean;
  pattern: string;
  organization: string;
  emails: EmailResult[];
}

export interface EmailResult {
  value: string;
  type: string;
  confidence: number;
  first_name: string;
  last_name: string;
  position: string;
  seniority: string;
  department: string;
  linkedin: string | null;
  twitter: string | null;
  phone_number: string | null;
  verification: {
    date: string;
    status: string;
  };
}

export interface EmailFinderResult {
  first_name: string;
  last_name: string;
  email: string;
  score: number;
  position: string;
  linkedin: string | null;
  twitter: string | null;
  company: string;
}

export interface EmailVerifierResult {
  status: string;
  result: string;
  score: number;
  email: string;
  regexp: boolean;
  gibberish: boolean;
  disposable: boolean;
  webmail: boolean;
  mx_records: boolean;
  smtp_server: boolean;
  smtp_check: boolean;
  accept_all: boolean;
  block: boolean;
}

export interface CompanyEnrichmentResult {
  domain: string;
  name: string;
  type: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street: string;
  logo: string;
  linkedin_url: string;
  twitter: string;
  facebook: string;
  phone_number: string;
  industry: string;
  employees: number;
  founded: number;
  annual_revenue: number;
  technologies: string[];
}

export interface PersonEnrichmentResult {
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  position: string;
  seniority: string;
  department: string;
  linkedin: string;
  twitter: string;
  phone_number: string;
  company: string;
}

class HunterClient {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor(apiKey: string = HUNTER_API_KEY, baseUrl: string = HUNTER_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Domain Search - Find email addresses from a domain
   * Cost: 3 credits
   * GET https://api.hunter.io/v2/domain-search?domain=stripe.com&api_key=xxx
   */
  async domainSearch(domain: string, options: DomainSearchOptions = {}): Promise<DomainSearchResult> {
    try {
      const cacheKey = this.getCacheKey('domain-search', { domain, ...options });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        domain,
        api_key: this.apiKey,
        limit: options.limit?.toString() || '10',
        offset: options.offset?.toString() || '0',
        ...(options.type && { type: options.type }),
        ...(options.seniority && { seniority: options.seniority }),
        ...(options.department && { department: options.department }),
      });
    
      const response = await fetch(`${this.baseUrl}/domain-search?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.details || `Domain search failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Domain search error:', error);
      throw error;
    }
  }

  /**
   * Email Finder - Find a specific email address
   * Cost: 3 credits
   * GET https://api.hunter.io/v2/email-finder?domain=reddit.com&first_name=Alexis&last_name=Ohanian&api_key=xxx
   */
  async emailFinder(domain: string, firstName: string, lastName: string): Promise<EmailFinderResult> {
    try {
      const cacheKey = this.getCacheKey('email-finder', { domain, firstName, lastName });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        domain,
        first_name: firstName,
        last_name: lastName,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/email-finder?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.details || `Email finder failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Email finder error:', error);
      throw error;
    }
  }

  /**
   * Email Verifier - Verify an email address
   * Cost: 1 credit
   * GET https://api.hunter.io/v2/email-verifier?email=patrick@stripe.com&api_key=xxx
   */
  async emailVerifier(email: string): Promise<EmailVerifierResult> {
    try {
      const cacheKey = this.getCacheKey('email-verifier', { email });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        email,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/email-verifier?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.details || `Email verification failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Company Enrichment - Get company information
   * Cost: 2 credits
   * GET https://api.hunter.io/v2/companies/find?domain=stripe.com&api_key=xxx
   */
  async companyEnrichment(domain: string): Promise<CompanyEnrichmentResult> {
    try {
      const cacheKey = this.getCacheKey('company-enrichment', { domain });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        domain,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/companies/find?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.details || `Company enrichment failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Company enrichment error:', error);
      throw error;
    }
  }

  /**
   * Person Enrichment - Get person information
   * Cost: 2 credits
   * GET https://api.hunter.io/v2/people/find?email=patrick@stripe.com&api_key=xxx
   * OU usando LinkedIn: https://api.hunter.io/v2/people/find?linkedin_handle=matttharp&api_key=xxx
   */
  async personEnrichment(emailOrLinkedIn: string): Promise<PersonEnrichmentResult> {
    try {
      // Detecta se é email ou LinkedIn handle
      const isEmail = emailOrLinkedIn.includes('@');
      const isLinkedInUrl = emailOrLinkedIn.includes('linkedin.com');
      
      let cacheKey: string;
      const params = new URLSearchParams({
        api_key: this.apiKey,
      });

      if (isLinkedInUrl) {
        // Extrai handle do LinkedIn URL
        // Ex: https://linkedin.com/in/matttharp → matttharp
        const handleMatch = emailOrLinkedIn.match(/linkedin\.com\/in\/([^/?]+)/);
        if (handleMatch) {
          const handle = handleMatch[1];
          params.append('linkedin_handle', handle);
          cacheKey = this.getCacheKey('person-enrichment-linkedin', { handle });
          console.log(`🔍 Enriquecendo por LinkedIn handle: ${handle}`);
        } else {
          throw new Error('URL do LinkedIn inválida. Use o formato: https://linkedin.com/in/handle');
        }
      } else if (isEmail) {
        params.append('email', emailOrLinkedIn);
        cacheKey = this.getCacheKey('person-enrichment', { email: emailOrLinkedIn });
        console.log(`🔍 Enriquecendo por email: ${emailOrLinkedIn}`);
      } else {
        // Assume que é um LinkedIn handle direto (sem URL)
        params.append('linkedin_handle', emailOrLinkedIn);
        cacheKey = this.getCacheKey('person-enrichment-linkedin', { handle: emailOrLinkedIn });
        console.log(`🔍 Enriquecendo por LinkedIn handle: ${emailOrLinkedIn}`);
      }

      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await fetch(`${this.baseUrl}/people/find?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.details || `Person enrichment failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Person enrichment error:', error);
      throw error;
    }
  }

  /**
   * Combined Enrichment - Get both person and company information
   * Cost: 3 credits
   * GET https://api.hunter.io/v2/combined/find?email=patrick@stripe.com&api_key=xxx
   */
  async combinedEnrichment(email: string): Promise<any> {
    try {
      const cacheKey = this.getCacheKey('combined-enrichment', { email });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        email,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/combined/find?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.details || `Combined enrichment failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      console.error('Combined enrichment error:', error);
      throw error;
    }
  }

  /**
   * Discover - Search for companies and contacts
   * Cost: 5 credits
   * POST https://api.hunter.io/v2/discover?api_key=xxx
   */
  async discover(query: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/discover?api_key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.details || `Discover failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Discover error:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const hunterClient = new HunterClient();
export default hunterClient;

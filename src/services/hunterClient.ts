// =====================================================// =====================================================

// HUNTER.IO API CLIENT - Real Integration// HUNTER CLIENT - API Integration

// Sistema de créditos: cobra 3x o custo da API// Cliente para integração com Hunter.io API

// =====================================================// =====================================================



// Real Hunter.io API Keyinterface HunterConfig {

const HUNTER_API_KEY = 'c2e0acf158a10a3c0253b49c006a80979679cc5c';  apiKey: string;

const HUNTER_BASE_URL = 'https://api.hunter.io/v2';  baseUrl: string;

}

// Credit costs (how much we charge the client)

export const CREDIT_COSTS = {interface ProspectionFilters {

  DOMAIN_SEARCH: 3,        // 3 créditos por busca de domínio  sector?: string;

  EMAIL_FINDER: 3,         // 3 créditos por busca de email  country?: string;

  EMAIL_VERIFIER: 1,       // 1 crédito por verificação  city?: string;

  COMPANY_ENRICHMENT: 2,   // 2 créditos por enriquecimento de empresa  revenueMin?: number;

  PERSON_ENRICHMENT: 2,    // 2 créditos por enriquecimento de pessoa  revenueMax?: number;

  COMBINED_ENRICHMENT: 3,  // 3 créditos por enriquecimento combinado  employeesMin?: number;

  DISCOVER: 5,             // 5 créditos por discover  employeesMax?: number;

};  keywords?: string[];

}

// Interfaces

export interface DomainSearchOptions {interface CompanyResult {

  limit?: number;  companyName: string;

  offset?: number;  domain: string;

  type?: 'personal' | 'generic';  city?: string;

  seniority?: 'junior' | 'senior' | 'executive';  country?: string;

  department?: string;  revenue?: number;

}  employees?: number;

  sector?: string;

export interface DomainSearchResult {}

  domain: string;

  disposable: boolean;interface EmailResult {

  webmail: boolean;  email: string;

  pattern: string;  firstName: string;

  organization: string;  lastName: string;

  emails: EmailResult[];  position: string;

}  score: number;

  linkedinProfile?: string;

export interface EmailResult {  verified: boolean;

  value: string;}

  type: string;

  confidence: number;class HunterClient {

  first_name: string;  private config: HunterConfig;

  last_name: string;  private cache: Map<string, any> = new Map();

  position: string;  private rateLimitReset: number = 0;

  seniority: string;

  department: string;  constructor(config: HunterConfig) {

  linkedin: string | null;    this.config = config;

  twitter: string | null;  }

  phone_number: string | null;

  verification: {  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {

    date: string;    // Check rate limit

    status: string;    if (Date.now() < this.rateLimitReset) {

  };      throw new Error('Rate limit exceeded. Try again later.');

}    }



export interface EmailFinderResult {    // Check cache

  first_name: string;    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

  last_name: string;    if (this.cache.has(cacheKey)) {

  email: string;      return this.cache.get(cacheKey);

  score: number;    }

  position: string;

  linkedin: string | null;    try {

  twitter: string | null;      const url = new URL(`${this.config.baseUrl}/${endpoint}`);

  company: string;      url.searchParams.append('api_key', this.config.apiKey);

}      

      Object.entries(params).forEach(([key, value]) => {

export interface EmailVerifierResult {        if (value !== undefined && value !== null) {

  status: string;          url.searchParams.append(key, String(value));

  result: string;        }

  score: number;      });

  email: string;

  regexp: boolean;      const response = await fetch(url.toString(), {

  gibberish: boolean;        headers: {

  disposable: boolean;          'User-Agent': 'SnapDoor-CRM/1.0'

  webmail: boolean;        }

  mx_records: boolean;      });

  smtp_server: boolean;

  smtp_check: boolean;      if (response.status === 429) {

  accept_all: boolean;        this.rateLimitReset = Date.now() + 60000; // Wait 1 minute

  block: boolean;        throw new Error('Rate limit exceeded');

}      }



export interface CompanyEnrichmentResult {      if (!response.ok) {

  domain: string;        throw new Error(`Hunter API error: ${response.status} ${response.statusText}`);

  name: string;      }

  type: string;

  country: string;      const data = await response.json();

  state: string;      

  city: string;      // Cache successful responses for 1 hour

  postal_code: string;      this.cache.set(cacheKey, data);

  street: string;      setTimeout(() => this.cache.delete(cacheKey), 3600000);

  logo: string;

  linkedin_url: string;      return data;

  twitter: string;    } catch (error) {

  facebook: string;      console.error(`Hunter API request failed: ${endpoint}`, error);

  phone_number: string;      throw error;

  industry: string;    }

  employees: number;  }

  founded: number;

  annual_revenue: number;  async discoverCompanies(filters: ProspectionFilters, limit: number = 50): Promise<CompanyResult[]> {

  technologies: string[];    const params = {

}      type: 'company',

      limit,

export interface PersonEnrichmentResult {      ...(filters.sector && { industry: filters.sector }),

  email: string;      ...(filters.country && { country: filters.country }),

  first_name: string;      ...(filters.city && { city: filters.city }),

  last_name: string;      ...(filters.employeesMin && { company_size_min: filters.employeesMin }),

  full_name: string;      ...(filters.employeesMax && { company_size_max: filters.employeesMax })

  position: string;    };

  seniority: string;

  department: string;    const response = await this.makeRequest('v2/leads', params);

  linkedin: string;    

  twitter: string;    return response.data?.leads?.map((lead: any) => ({

  phone_number: string;      companyName: lead.company_name || lead.organization,

  company: string;      domain: lead.domain || lead.website,

}      city: lead.city,

      country: lead.country,

class HunterClient {      revenue: lead.revenue,

  private apiKey: string;      employees: lead.company_size,

  private baseUrl: string;      sector: lead.industry

  private cache: Map<string, { data: any; timestamp: number }> = new Map();    })) || [];

  private readonly CACHE_TTL = 3600000; // 1 hour  }



  constructor(apiKey: string = HUNTER_API_KEY, baseUrl: string = HUNTER_BASE_URL) {  async searchDomainEmails(domain: string, limit: number = 10): Promise<EmailResult[]> {

    this.apiKey = apiKey;    const response = await this.makeRequest('v2/domain-search', {

    this.baseUrl = baseUrl;      domain,

  }      limit,

      type: 'personal'

  private getCacheKey(endpoint: string, params: Record<string, any>): string {    });

    return `${endpoint}:${JSON.stringify(params)}`;

  }    return response.data?.emails?.map((email: any) => ({

      email: email.value,

  private getFromCache(key: string): any | null {      firstName: email.first_name,

    const cached = this.cache.get(key);      lastName: email.last_name,

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {      position: email.position,

      return cached.data;      score: email.confidence,

    }      linkedinProfile: email.linkedin,

    this.cache.delete(key);      verified: email.verification?.result === 'deliverable'

    return null;    })) || [];

  }  }



  private setCache(key: string, data: any): void {  async findEmail(domain: string, firstName: string, lastName: string): Promise<EmailResult | null> {

    this.cache.set(key, { data, timestamp: Date.now() });    const response = await this.makeRequest('v2/email-finder', {

  }      domain,

      first_name: firstName,

  /**      last_name: lastName

   * Domain Search - Find email addresses from a domain    });

   * Cost: 3 credits

   * GET https://api.hunter.io/v2/domain-search?domain=stripe.com&api_key=xxx    if (response.data?.email) {

   */      return {

  async domainSearch(domain: string, options: DomainSearchOptions = {}): Promise<DomainSearchResult> {        email: response.data.email,

    try {        firstName: response.data.first_name,

      const cacheKey = this.getCacheKey('domain-search', { domain, ...options });        lastName: response.data.last_name,

      const cached = this.getFromCache(cacheKey);        position: response.data.position,

      if (cached) return cached;        score: response.data.score,

        linkedinProfile: response.data.linkedin,

      const params = new URLSearchParams({        verified: response.data.verification?.result === 'deliverable'

        domain,      };

        api_key: this.apiKey,    }

        limit: options.limit?.toString() || '10',

        offset: options.offset?.toString() || '0',    return null;

        ...(options.type && { type: options.type }),  }

        ...(options.seniority && { seniority: options.seniority }),

        ...(options.department && { department: options.department }),  async verifyEmail(email: string): Promise<{ valid: boolean; score: number; result: string }> {

      });    const response = await this.makeRequest('v2/email-verifier', { email });

    

      const response = await fetch(`${this.baseUrl}/domain-search?${params}`, {    return {

        method: 'GET',      valid: response.data?.result === 'deliverable',

        headers: { 'Content-Type': 'application/json' },      score: response.data?.score || 0,

      });      result: response.data?.result || 'unknown'

    };

      if (!response.ok) {  }

        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.errors?.[0]?.details || `Domain search failed: ${response.statusText}`);  async enrichCompany(domain: string): Promise<CompanyResult | null> {

      }    const response = await this.makeRequest('v2/domain-search', {

      domain,

      const result = await response.json();      limit: 1

      this.setCache(cacheKey, result.data);    });

      return result.data;

    } catch (error) {    if (response.data?.organization) {

      console.error('Domain search error:', error);      return {

      throw error;        companyName: response.data.organization,

    }        domain: response.data.domain,

  }        city: response.data.city,

        country: response.data.country,

  /**        revenue: response.data.revenue,

   * Email Finder - Find a specific email address        employees: response.data.company_size,

   * Cost: 3 credits        sector: response.data.industry

   * GET https://api.hunter.io/v2/email-finder?domain=reddit.com&first_name=Alexis&last_name=Ohanian&api_key=xxx      };

   */    }

  async emailFinder(domain: string, firstName: string, lastName: string): Promise<EmailFinderResult> {

    try {    return null;

      const cacheKey = this.getCacheKey('email-finder', { domain, firstName, lastName });  }

      const cached = this.getFromCache(cacheKey);}

      if (cached) return cached;

// Initialize Hunter client

      const params = new URLSearchParams({export const hunterClient = new HunterClient({

        domain,  apiKey: process.env.HUNTER_API_KEY || '',

        first_name: firstName,  baseUrl: 'https://api.hunter.io'

        last_name: lastName,});

        api_key: this.apiKey,

      });export type { ProspectionFilters, CompanyResult, EmailResult };

      const response = await fetch(`${this.baseUrl}/email-finder?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
   */
  async personEnrichment(email: string): Promise<PersonEnrichmentResult> {
    try {
      const cacheKey = this.getCacheKey('person-enrichment', { email });
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = new URLSearchParams({
        email,
        api_key: this.apiKey,
      });

      const response = await fetch(`${this.baseUrl}/people/find?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

/**
 * SnapDoor CRM - Enrichment Type Definitions
 * 
 * This file contains type definitions for lead enrichment data,
 * replacing 'any' types with proper interfaces for type safety.
 */

/**
 * Enrichment data structure from LinkedIn, Hunter.io, and other sources
 */
export interface EnrichmentData {
  // Company information
  company?: string;
  company_size?: string;
  industry?: string;
  founded_year?: number;
  website?: string;
  company_linkedin?: string;
  
  // Person information
  position?: string;
  seniority?: string;
  department?: string;
  linkedin_url?: string;
  location?: string;
  country?: string;
  city?: string;
  
  // Contact information
  email_verified?: boolean;
  phone_verified?: boolean;
  social_profiles?: SocialProfiles;
  
  // Professional details
  skills?: string[];
  languages?: string[];
  certifications?: string[];
  education?: Education[];
  work_history?: WorkHistory[];
  
  // Enrichment metadata
  enriched_at?: string;
  confidence_score?: number;
  sources?: string[];
  
  // Hunter.io specific
  hunter_score?: number;
  hunter_status?: 'valid' | 'invalid' | 'unknown' | 'accept_all' | 'webmail';
  
  // Additional custom fields
  [key: string]: unknown;
}

/**
 * Social media profiles
 */
export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  [key: string]: string | undefined;
}

/**
 * Education history
 */
export interface Education {
  school: string;
  degree?: string;
  field?: string;
  start_year?: number;
  end_year?: number;
}

/**
 * Work history
 */
export interface WorkHistory {
  company: string;
  title: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
}

/**
 * Query parameters for API requests (Hunter.io, Discovery API, etc)
 */
export interface QueryParams {
  // Email finder
  domain?: string;
  company?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  
  // Email verifier
  email?: string;
  
  // Domain search
  limit?: number;
  offset?: number;
  type?: 'personal' | 'generic';
  seniority?: string[];
  department?: string[];
  
  // LinkedIn scraper
  linkedin_url?: string;
  profile_id?: string;
  
  // Discovery API
  query?: string;
  location?: string;
  industry?: string;
  company_size?: string;
  
  // Generic parameters
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Result summary for API responses
 */
export interface ResultSummary {
  // Success indicators
  found: boolean;
  success: boolean;
  
  // Confidence and quality
  confidence?: number;
  score?: number;
  accuracy?: number;
  
  // Sources and methods
  sources: string[];
  enriched_fields: string[];
  method?: string;
  
  // Counts and metadata
  total_results?: number;
  results_returned?: number;
  credits_used?: number;
  
  // Error information
  error?: string;
  error_code?: string;
  warnings?: string[];
  
  // Timing
  response_time_ms?: number;
  cached?: boolean;
  
  // Additional metadata
  [key: string]: unknown;
}

/**
 * Credit usage tracking
 */
export interface CreditUsage {
  operation_type: string;
  credits_used: number;
  domain?: string | null;
  email?: string | null;
  query_params: QueryParams | null;
  result_summary: ResultSummary | null;
  success: boolean;
  error_message?: string | null;
}

/**
 * Hunter.io Email Finder Response
 */
export interface HunterEmailFinderResponse {
  email: string;
  score: number;
  first_name: string;
  last_name: string;
  position: string;
  linkedin: string | null;
  twitter: string | null;
  phone_number: string | null;
  company: string;
  sources: Array<{
    domain: string;
    uri: string;
    extracted_on: string;
    last_seen_on: string;
    still_on_page: boolean;
  }>;
}

/**
 * Hunter.io Email Verifier Response
 */
export interface HunterEmailVerifierResponse {
  email: string;
  status: 'valid' | 'invalid' | 'unknown' | 'accept_all' | 'webmail';
  score: number;
  regexp: boolean;
  gibberish: boolean;
  disposable: boolean;
  webmail: boolean;
  mx_records: boolean;
  smtp_server: boolean;
  smtp_check: boolean;
  accept_all: boolean;
  block: boolean;
  sources: number;
}

/**
 * Hunter.io Domain Search Response
 */
export interface HunterDomainSearchResponse {
  domain: string;
  disposable: boolean;
  webmail: boolean;
  accept_all: boolean;
  pattern: string;
  organization: string;
  emails: Array<{
    value: string;
    type: 'personal' | 'generic';
    confidence: number;
    first_name: string;
    last_name: string;
    position: string;
    seniority: string;
    department: string;
    linkedin: string | null;
    twitter: string | null;
    phone_number: string | null;
    sources: Array<{
      domain: string;
      uri: string;
      extracted_on: string;
      last_seen_on: string;
      still_on_page: boolean;
    }>;
  }>;
}

/**
 * Workflow context data (replacing any in workflow.ts)
 */
export interface WorkflowContext {
  lead?: {
    id: string;
    name: string;
    email: string;
    company?: string;
    [key: string]: unknown;
  };
  user?: {
    id: string;
    email: string;
    [key: string]: unknown;
  };
  trigger?: {
    type: string;
    data: Record<string, unknown>;
  };
  variables?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  success: boolean;
  executed_steps: number;
  failed_steps: number;
  output: Record<string, unknown>;
  errors: Array<{
    step: string;
    message: string;
    timestamp: string;
  }>;
  started_at: string;
  completed_at: string;
  duration_ms: number;
}

/**
 * Trigger data for workflows
 */
export interface TriggerData {
  type: 'lead_created' | 'lead_updated' | 'deal_stage_changed' | 'email_received' | 'scheduled' | 'manual';
  entity_id?: string;
  entity_type?: string;
  changes?: {
    field: string;
    from_value?: string | number | boolean | null;
    to_value?: string | number | boolean | null;
  }[];
  timestamp: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

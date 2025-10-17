/**
 * Tipos relacionados a empresas
 */

export interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  logo_url: string | null;
  
  // Campos de enriquecimento
  description: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  phone: string | null;
  
  // Metadados
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CompanyFormData {
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  location?: string;
  logo_url?: string;
  description?: string;
  website?: string;
  linkedin_url?: string;
  twitter_url?: string;
  phone?: string;
}

export interface CompanyFilters {
  search?: string;
  industry?: string;
  size?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  userId?: string; // ✅ Adicionar userId
}

// Tamanhos de empresa padronizados
export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 funcionários' },
  { value: '11-50', label: '11-50 funcionários' },
  { value: '51-200', label: '51-200 funcionários' },
  { value: '201-500', label: '201-500 funcionários' },
  { value: '501-1000', label: '501-1000 funcionários' },
  { value: '1001-5000', label: '1001-5000 funcionários' },
  { value: '5001+', label: '5000+ funcionários' },
] as const;

// Indústrias comuns
export const INDUSTRIES = [
  'Tecnologia',
  'Saúde',
  'Financeiro',
  'Educação',
  'Varejo',
  'Manufatura',
  'Imobiliário',
  'Consultoria',
  'Marketing',
  'E-commerce',
  'SaaS',
  'Telecomunicações',
  'Energia',
  'Agricultura',
  'Logística',
  'Outros',
] as const;

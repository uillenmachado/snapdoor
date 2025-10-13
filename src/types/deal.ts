/**
 * Tipos relacionados a negócios (deals)
 */

export interface Deal {
  id: string;
  user_id: string;
  pipeline_id: string;
  stage_id: string;
  
  // Informações básicas
  title: string;
  value: number;
  currency: string;
  
  // Empresa
  company_id: string | null;
  company_name: string | null;
  
  // Status e probabilidade
  status: 'open' | 'won' | 'lost';
  probability: number;
  
  // Datas
  expected_close_date: string | null;
  closed_date: string | null;
  
  // Responsável
  owner_id: string | null;
  
  // Campos adicionais
  description: string | null;
  lost_reason: string | null;
  source: string | null;
  tags: string[] | null;
  custom_fields: Record<string, any>;
  
  // Posição no kanban
  position: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface DealFormData {
  title: string;
  value?: number;
  currency?: string;
  company_id?: string;
  company_name?: string;
  status?: 'open' | 'won' | 'lost';
  probability?: number;
  expected_close_date?: string;
  owner_id?: string;
  description?: string;
  source?: string;
  tags?: string[];
}

export interface DealFilters {
  search?: string;
  status?: 'open' | 'won' | 'lost' | 'all';
  company_id?: string;
  owner_id?: string;
  min_value?: number;
  max_value?: number;
  stage_id?: string;
  sortBy?: 'title' | 'value' | 'created_at' | 'expected_close_date';
  sortOrder?: 'asc' | 'desc';
}

// Status de deals
export const DEAL_STATUS = {
  open: { label: 'Aberto', color: 'blue' },
  won: { label: 'Ganho', color: 'green' },
  lost: { label: 'Perdido', color: 'red' },
} as const;

// Moedas suportadas
export const CURRENCIES = [
  { value: 'BRL', label: 'R$ (Real)', symbol: 'R$' },
  { value: 'USD', label: '$ (Dólar)', symbol: '$' },
  { value: 'EUR', label: '€ (Euro)', symbol: '€' },
] as const;

// Fontes de leads/deals
export const DEAL_SOURCES = [
  'Website',
  'Indicação',
  'LinkedIn',
  'Cold Call',
  'Email Marketing',
  'Evento',
  'Parceiro',
  'Publicidade',
  'Outros',
] as const;

/**
 * Formatar valor monetário
 */
export function formatCurrency(value: number, currency: string = 'BRL'): string {
  const currencyInfo = CURRENCIES.find(c => c.value === currency);
  const symbol = currencyInfo?.symbol || 'R$';
  
  return `${symbol} ${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calcular valor total de deals
 */
export function calculateTotalValue(deals: Deal[]): number {
  return deals.reduce((total, deal) => total + (deal.value || 0), 0);
}

/**
 * Calcular valor ponderado (por probabilidade)
 */
export function calculateWeightedValue(deals: Deal[]): number {
  return deals.reduce((total, deal) => {
    const probability = deal.probability / 100;
    return total + ((deal.value || 0) * probability);
  }, 0);
}

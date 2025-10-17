// @ts-nocheck - Tipos do Supabase precisam ser regenerados após migration de companies
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

export type { Company };

/**
 * Extrai o domínio de um email
 * Ex: "john@google.com" -> "google.com"
 */
export function extractDomainFromEmail(email: string): string | null {
  const match = email.match(/@([^@]+)$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Extrai o domínio de uma URL de website
 * Ex: "https://www.google.com/about" -> "google.com"
 */
export function extractDomainFromWebsite(website: string): string | null {
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Busca ou cria uma empresa baseada no nome e domínio
 * Usa o domínio como chave primária de deduplicação
 */
export async function findOrCreateCompany(params: {
  name: string;
  domain?: string | null;
  userId: string;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  logo_url?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
}): Promise<Company> {
  const { name, domain, userId, ...otherFields } = params;

  console.log("🏢 findOrCreateCompany:", { name, domain, userId });

  // 1. Se temos domínio, buscar por domínio (mais confiável)
  if (domain) {
    const { data: existingByDomain, error: domainError } = await supabase
      .from("companies")
      .select("*")
      .eq("domain", domain)
      .eq("user_id", userId)
      .maybeSingle();

    if (domainError) {
      console.error("❌ Erro ao buscar empresa por domínio:", domainError);
    }

    if (existingByDomain) {
      console.log("✅ Empresa encontrada por domínio:", existingByDomain.name);
      
      // Atualizar campos se novos dados foram fornecidos
      const updateData: any = {};
      if (otherFields.industry && !existingByDomain.industry) updateData.industry = otherFields.industry;
      if (otherFields.size && !existingByDomain.size) updateData.size = otherFields.size;
      if (otherFields.location && !existingByDomain.location) updateData.location = otherFields.location;
      if (otherFields.logo_url && !existingByDomain.logo_url) updateData.logo_url = otherFields.logo_url;
      if (otherFields.website && !existingByDomain.website) updateData.website = otherFields.website;
      if (otherFields.linkedin_url && !existingByDomain.linkedin_url) updateData.linkedin_url = otherFields.linkedin_url;

      if (Object.keys(updateData).length > 0) {
        const { data: updated, error: updateError } = await supabase
          .from("companies")
          .update(updateData)
          .eq("id", existingByDomain.id)
          .select()
          .single();

        if (updateError) {
          console.error("❌ Erro ao atualizar empresa:", updateError);
          return existingByDomain as Company;
        }

        console.log("✅ Empresa atualizada com novos dados");
        return updated as Company;
      }

      return existingByDomain as Company;
    }
  }

  // 2. Se não encontrou por domínio, buscar por nome exato
  const { data: existingByName, error: nameError } = await supabase
    .from("companies")
    .select("*")
    .ilike("name", name)
    .eq("user_id", userId)
    .maybeSingle();

  if (nameError) {
    console.error("❌ Erro ao buscar empresa por nome:", nameError);
  }

  if (existingByName) {
    console.log("✅ Empresa encontrada por nome:", existingByName.name);
    
    // Se encontrou por nome mas temos um domínio novo, atualizar
    if (domain && !existingByName.domain) {
      const { data: updated, error: updateError } = await supabase
        .from("companies")
        .update({ domain, ...otherFields })
        .eq("id", existingByName.id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Erro ao atualizar domínio da empresa:", updateError);
        return existingByName as Company;
      }

      console.log("✅ Domínio adicionado à empresa existente");
      return updated as Company;
    }

    return existingByName as Company;
  }

  // 3. Criar nova empresa
  console.log("➕ Criando nova empresa:", name);
  const { data: newCompany, error: createError } = await supabase
    .from("companies")
    .insert({
      name,
      domain,
      user_id: userId,
      ...otherFields,
    })
    .select()
    .single();

  if (createError) {
    console.error("❌ Erro ao criar empresa:", createError);
    throw createError;
  }

  console.log("✅ Empresa criada:", newCompany.name);
  return newCompany as Company;
}

/**
 * Busca todos os leads de uma empresa
 */
export async function getCompanyLeads(companyId: string) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("❌ Erro ao buscar leads da empresa:", error);
    throw error;
  }

  return data;
}

/**
 * Busca todas as empresas do usuário
 */
export async function getUserCompanies(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*, leads:leads(count)")
    .eq("user_id", userId)
    .order("name", { ascending: true});

  if (error) {
    console.error("❌ Erro ao buscar empresas:", error);
    throw error;
  }

  return data;
}

/**
 * Atualiza informações da empresa a partir de dados de enriquecimento
 */
export async function updateCompanyFromEnrichment(companyId: string, enrichmentData: {
  company_industry?: string | null;
  company_size?: string | null;
  company_location?: string | null;
}) {
  const updateData: any = {};
  
  if (enrichmentData.company_industry) updateData.industry = enrichmentData.company_industry;
  if (enrichmentData.company_size) updateData.size = enrichmentData.company_size;
  if (enrichmentData.company_location) updateData.location = enrichmentData.company_location;

  if (Object.keys(updateData).length === 0) {
    console.log("⚠️ Nenhum dado de enriquecimento para atualizar empresa");
    return null;
  }

  console.log("🔄 Atualizando empresa com dados de enriquecimento:", updateData);

  const { data, error } = await supabase
    .from("companies")
    .update(updateData)
    .eq("id", companyId)
    .select()
    .single();

  if (error) {
    console.error("❌ Erro ao atualizar empresa com enriquecimento:", error);
    throw error;
  }

  console.log("✅ Empresa atualizada com dados de enriquecimento");
  return data;
}

/**
 * Buscar empresas com filtros e paginação
 */
export async function fetchCompanies(
  filters?: {
    search?: string;
    industry?: string;
    size?: string;
    sortBy?: 'name' | 'created_at' | 'updated_at';
    sortOrder?: 'asc' | 'desc';
    userId?: string; // ✅ Adicionar userId nos filtros
  },
  page = 1,
  pageSize = 20
): Promise<{ companies: Company[]; count: number }> { // ✅ Corrigir tipo de retorno
  let query = supabase
    .from('companies')
    .select('*', { count: 'exact' });

  // ✅ FILTRAR POR USER_ID (obrigatório para RLS)
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  // Aplicar busca
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Aplicar filtros
  if (filters?.industry) {
    query = query.eq('industry', filters.industry);
  }

  if (filters?.size) {
    query = query.eq('size', filters.size);
  }

  // Aplicar ordenação
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Aplicar paginação
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Erro ao buscar empresas:', error);
    throw new Error(`Erro ao buscar empresas: ${error.message}`);
  }

  console.log('✅ Empresas buscadas:', { total: count, empresas: data?.map(c => c.name) });

  // ✅ Retornar no formato correto: { data: [], count: 0 }
  return { 
    data: (data || []) as Company[], 
    count: count || 0 
  };
}

/**
 * Buscar empresa por ID
 */
export async function fetchCompanyById(id: string): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar empresa:', error);
    throw new Error(`Erro ao buscar empresa: ${error.message}`);
  }

  if (!data) {
    throw new Error('Empresa não encontrada');
  }

  return data as Company;
}

/**
 * Criar nova empresa
 */
export async function createCompany(companyData: Partial<Company>): Promise<Company> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('companies')
    .insert([{
      ...companyData,
      user_id: user.id,
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar empresa:', error);
    throw new Error(`Erro ao criar empresa: ${error.message}`);
  }

  return data as Company;
}

/**
 * Atualizar empresa existente
 */
export async function updateCompany(
  id: string,
  updates: Partial<Company>
): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar empresa:', error);
    throw new Error(`Erro ao atualizar empresa: ${error.message}`);
  }

  return data as Company;
}

/**
 * Deletar empresa
 */
export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar empresa:', error);
    throw new Error(`Erro ao deletar empresa: ${error.message}`);
  }
}

/**
 * Contar leads por empresa
 */
export async function countLeadsByCompany(companyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (error) {
    console.error('Erro ao contar leads:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Contar deals por empresa
 */
export async function countDealsByCompany(companyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  if (error) {
    console.error('Erro ao contar deals:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Buscar estatísticas da empresa
 */
export async function fetchCompanyStats(companyId: string) {
  const [leadsCount, dealsCount] = await Promise.all([
    countLeadsByCompany(companyId),
    countDealsByCompany(companyId),
  ]);

  return {
    leadsCount,
    dealsCount,
  };
}

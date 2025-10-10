// @ts-nocheck - Tipos do Supabase precisam ser regenerados após migration de companies
import { supabase } from "@/integrations/supabase/client";

export interface Company {
  id: string;
  name: string;
  domain?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  logo_url?: string | null;
  description?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

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

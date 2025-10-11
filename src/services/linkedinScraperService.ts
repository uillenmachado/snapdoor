// =====================================================
// LINKEDIN SCRAPER SERVICE
// Extrai dados públicos de perfis do LinkedIn via Edge Function
// =====================================================

import { supabase } from '@/integrations/supabase/client';

export interface LinkedInProfileData {
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string; // Ex: "CEO" or "CEO at Company"
  company?: string;
  position?: string;
  location?: string;
  education?: string;
  connections?: string;
  about?: string; // Resumo "Sobre" do perfil
  profileUrl: string;
  imageUrl?: string;
}

/**
 * Extrai informações básicas de um perfil público do LinkedIn
 * Usa Supabase Edge Function para evitar problemas de CORS
 */
export class LinkedInScraperService {
  
  /**
   * Extrai dados de um perfil público do LinkedIn via Edge Function
   * @param linkedInUrl URL do perfil (ex: https://linkedin.com/in/billgates)
   */
  async extractProfileData(linkedInUrl: string): Promise<LinkedInProfileData | null> {
    try {
      console.log('🔍 [LinkedIn Scraper] Extraindo dados públicos do perfil:', linkedInUrl);
      
      // Normaliza a URL
      const handle = this.extractHandle(linkedInUrl);
      if (!handle) {
        throw new Error('URL do LinkedIn inválida');
      }
      
      const profileUrl = `https://www.linkedin.com/in/${handle}`;
      
      // Chama Edge Function do Supabase (Camada 3 - Gratuita)
      console.log('📡 [LinkedIn Scraper] Chamando Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('linkedin-scraper', {
        body: { linkedinUrl: profileUrl },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (error) {
        console.error('❌ [LinkedIn Scraper] Erro na Edge Function:', error);
        return null;
      }
      
      if (!data?.success || !data?.data) {
        console.warn('⚠️ [LinkedIn Scraper] Edge Function não retornou dados');
        return null;
      }
      
      console.log('✅ [LinkedIn Scraper] Dados extraídos com sucesso:', data.data);
      
      return data.data as LinkedInProfileData;
      
    } catch (error) {
      console.error('❌ [LinkedIn Scraper] Erro ao extrair dados:', error);
      return null;
    }
  }
  
  /**
   * Extrai o handle do LinkedIn de uma URL
   */
  private extractHandle(url: string): string | null {
    const match = url.match(/linkedin\.com\/in\/([^/?]+)/i);
    return match ? match[1] : null;
  }
}

export const linkedInScraperService = new LinkedInScraperService();

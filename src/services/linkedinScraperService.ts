// =====================================================
// LINKEDIN SCRAPER SERVICE
// Extrai dados públicos de perfis do LinkedIn
// =====================================================

export interface LinkedInProfileData {
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string; // Ex: "CEO at Company"
  company?: string;
  position?: string;
  location?: string;
  profileUrl: string;
  imageUrl?: string;
  about?: string;
}

/**
 * Extrai informações básicas de um perfil público do LinkedIn
 * Usa técnicas de parsing de HTML público (sem necessidade de autenticação)
 */
export class LinkedInScraperService {
  
  /**
   * Extrai dados de um perfil público do LinkedIn
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
      
      // Faz requisição para obter o HTML público do perfil
      const response = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      
      if (!response.ok) {
        console.warn('❌ [LinkedIn Scraper] Perfil não acessível (pode ser privado ou não existir)');
        return null;
      }
      
      const html = await response.text();
      
      // Extrai dados usando regex e parsing do HTML público
      const profileData = this.parsePublicProfile(html, profileUrl);
      
      if (profileData) {
        console.log('✅ [LinkedIn Scraper] Dados extraídos com sucesso:', profileData);
      }
      
      return profileData;
      
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
  
  /**
   * Faz parsing do HTML público do LinkedIn para extrair informações estruturadas
   */
  private parsePublicProfile(html: string, profileUrl: string): LinkedInProfileData | null {
    try {
      // LinkedIn usa JSON-LD (Schema.org) em perfis públicos
      // Busca pelo script type="application/ld+json"
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/s);
      
      if (jsonLdMatch) {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        
        // Extrai dados estruturados
        const name = jsonData.name || jsonData.givenName + ' ' + jsonData.familyName;
        const nameParts = name.split(' ');
        
        return {
          fullName: name,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          headline: jsonData.jobTitle || jsonData.description || '',
          position: jsonData.jobTitle || this.extractPosition(jsonData.jobTitle),
          company: this.extractCompany(jsonData.jobTitle),
          location: jsonData.address?.addressLocality || '',
          profileUrl: profileUrl,
          imageUrl: jsonData.image || undefined,
          about: jsonData.description || undefined,
        };
      }
      
      // Fallback: tenta extrair via meta tags Open Graph
      const ogTitle = this.extractMetaContent(html, 'og:title');
      const ogDescription = this.extractMetaContent(html, 'og:description');
      const ogImage = this.extractMetaContent(html, 'og:image');
      
      if (ogTitle) {
        const name = ogTitle.split(' - ')[0].trim();
        const nameParts = name.split(' ');
        
        // og:description geralmente tem formato: "Position at Company | Additional info"
        const headline = ogDescription || '';
        const positionCompany = headline.split('|')[0].trim();
        
        return {
          fullName: name,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          headline: positionCompany,
          position: this.extractPosition(positionCompany),
          company: this.extractCompany(positionCompany),
          location: undefined,
          profileUrl: profileUrl,
          imageUrl: ogImage || undefined,
          about: headline,
        };
      }
      
      // Se nenhum método funcionar, tenta parsing manual do título da página
      const titleMatch = html.match(/<title>(.+?)<\/title>/i);
      if (titleMatch) {
        const title = titleMatch[1];
        const name = title.split(' - ')[0].trim();
        const nameParts = name.split(' ');
        
        return {
          fullName: name,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          headline: title.split(' - ')[1] || '',
          profileUrl: profileUrl,
        };
      }
      
      console.warn('⚠️ [LinkedIn Scraper] Não foi possível extrair dados estruturados');
      return null;
      
    } catch (error) {
      console.error('❌ [LinkedIn Scraper] Erro no parsing:', error);
      return null;
    }
  }
  
  /**
   * Extrai meta tag content do HTML
   */
  private extractMetaContent(html: string, property: string): string | null {
    const regex = new RegExp(`<meta\\s+(?:property|name)="${property}"\\s+content="([^"]+)"`, 'i');
    const match = html.match(regex);
    return match ? match[1] : null;
  }
  
  /**
   * Extrai a posição de um headline (ex: "CEO at Microsoft" -> "CEO")
   */
  private extractPosition(headline: string): string | undefined {
    if (!headline) return undefined;
    
    // Padrões comuns: "Position at Company", "Position | Company", "Position - Company"
    const patterns = [
      /^(.+?)\s+at\s+/i,
      /^(.+?)\s+\|\s+/,
      /^(.+?)\s+-\s+/,
      /^(.+?)\s+@\s+/,
    ];
    
    for (const pattern of patterns) {
      const match = headline.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Se não encontrar padrão, retorna o headline inteiro
    return headline.split(/[|@-]/)[0].trim();
  }
  
  /**
   * Extrai a empresa de um headline (ex: "CEO at Microsoft" -> "Microsoft")
   */
  private extractCompany(headline: string): string | undefined {
    if (!headline) return undefined;
    
    // Padrões comuns
    const patterns = [
      /\s+at\s+(.+?)(?:\||$)/i,
      /\s+@\s+(.+?)(?:\||$)/,
      /\|\s+(.+?)(?:\||$)/,
      /\s+-\s+(.+?)(?:\||$)/,
    ];
    
    for (const pattern of patterns) {
      const match = headline.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }
}

// Singleton instance
export const linkedInScraperService = new LinkedInScraperService();

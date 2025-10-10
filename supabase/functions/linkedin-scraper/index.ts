// =====================================================
// LINKEDIN PUBLIC DATA SCRAPER
// Supabase Edge Function
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkedInData {
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  company?: string;
  position?: string;
  location?: string;
  profileUrl: string;
  imageUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { linkedinUrl } = await req.json();
    
    if (!linkedinUrl) {
      return new Response(
        JSON.stringify({ error: 'LinkedIn URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Extraindo dados do LinkedIn:', linkedinUrl);

    // Faz requisição ao LinkedIn como se fosse um navegador
    const response = await fetch(linkedinUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Perfil não acessível' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    
    // Parsing do HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    if (!doc) {
      throw new Error('Erro ao parsear HTML');
    }

    // Extrai dados de meta tags Open Graph e outras tags
    const getMetaContent = (property: string): string | null => {
      // Tenta property primeiro
      let meta = doc.querySelector(`meta[property="${property}"]`);
      if (meta) return meta.getAttribute('content');
      
      // Tenta name se property não funcionar
      meta = doc.querySelector(`meta[name="${property}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    const ogTitle = getMetaContent('og:title') || getMetaContent('title');
    const ogDescription = getMetaContent('og:description') || getMetaContent('description');
    const ogImage = getMetaContent('og:image') || getMetaContent('image');
    
    // Tenta extrair do <title> se og:title não existir
    const pageTitle = doc.querySelector('title')?.textContent;

    const finalTitle = ogTitle || pageTitle || '';
    
    if (!finalTitle) {
      return new Response(
        JSON.stringify({ error: 'Não foi possível extrair dados do perfil' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📄 Título extraído:', finalTitle);
    console.log('📝 Descrição extraída:', ogDescription);

    // Parse do título: "Nome Completo - Cargo at Empresa | LinkedIn"
    // ou "Nome Completo | LinkedIn"
    const titleParts = finalTitle.split(/\s+-\s+|\s+\|\s+/);
    const name = titleParts[0].trim();
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Parse da descrição: "Cargo at Empresa | Additional info"
    const headline = ogDescription || (titleParts.length > 1 ? titleParts[1].replace('LinkedIn', '').trim() : '');
    const positionCompany = headline.split('|')[0].trim();
    
    // Extrai cargo e empresa com múltiplos padrões
    let position: string | undefined;
    let company: string | undefined;
    
    // Padrões: "at", "|", "-", "em", "na"
    const patterns = [
      { regex: /(.+?)\s+at\s+(.+)/i, posIdx: 1, compIdx: 2 },
      { regex: /(.+?)\s+@\s+(.+)/i, posIdx: 1, compIdx: 2 },
      { regex: /(.+?)\s+em\s+(.+)/i, posIdx: 1, compIdx: 2 },
      { regex: /(.+?)\s+na\s+(.+)/i, posIdx: 1, compIdx: 2 },
      { regex: /(.+?)\s+\|\s+(.+)/i, posIdx: 1, compIdx: 2 },
      { regex: /(.+?)\s+-\s+(.+)/i, posIdx: 1, compIdx: 2 },
    ];
    
    for (const pattern of patterns) {
      const match = positionCompany.match(pattern.regex);
      if (match) {
        position = match[pattern.posIdx].trim();
        company = match[pattern.compIdx].trim();
        break;
      }
    }
    
    // Se não encontrou padrão, assume que tudo é position
    if (!position && positionCompany) {
      position = positionCompany;
    }

    const profileData: LinkedInData = {
      fullName: name,
      firstName,
      lastName,
      headline: positionCompany,
      position,
      company,
      location: undefined, // Não disponível em perfis públicos sem autenticação
      profileUrl: linkedinUrl,
      imageUrl: ogImage || undefined,
    };

    console.log('✅ Dados extraídos:', profileData);

    return new Response(
      JSON.stringify({ data: profileData, success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

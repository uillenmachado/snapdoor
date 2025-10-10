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

    // Extrai dados de meta tags Open Graph
    const getMetaContent = (property: string): string | null => {
      const meta = doc.querySelector(`meta[property="${property}"]`);
      return meta ? meta.getAttribute('content') : null;
    };

    const ogTitle = getMetaContent('og:title');
    const ogDescription = getMetaContent('og:description');
    const ogImage = getMetaContent('og:image');

    if (!ogTitle) {
      return new Response(
        JSON.stringify({ error: 'Não foi possível extrair dados do perfil' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse do título: "Nome Completo - Cargo at Empresa | LinkedIn"
    const name = ogTitle.split(' - ')[0].trim();
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Parse da descrição: "Cargo at Empresa | Additional info"
    const headline = ogDescription || '';
    const positionCompany = headline.split('|')[0].trim();
    
    // Extrai cargo e empresa
    let position: string | undefined;
    let company: string | undefined;
    
    if (positionCompany.includes(' at ')) {
      const parts = positionCompany.split(' at ');
      position = parts[0].trim();
      company = parts[1].trim();
    } else if (positionCompany.includes(' | ')) {
      const parts = positionCompany.split(' | ');
      position = parts[0].trim();
      company = parts[1].trim();
    } else {
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

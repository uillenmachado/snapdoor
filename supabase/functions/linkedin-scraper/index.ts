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
  education?: string;
  connections?: string;
  about?: string;
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
    const titleParts = finalTitle.split(/\s+-\s+/);
    const name = titleParts[0].trim().replace(' | LinkedIn', '').replace(' - LinkedIn', '');
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Parse COMPLETO da descrição do LinkedIn
    // Formato: "Sobre · Experience: Empresa · Education: Educação · Location: Local · Conexões"
    let position: string | undefined;
    let company: string | undefined;
    let education: string | undefined;
    let location: string | undefined;
    let connections: string | undefined;
    let about: string | undefined;

    if (ogDescription) {
      // Extrai "Sobre" (primeira parte antes do ·)
      const aboutMatch = ogDescription.match(/^(.+?)(?:\s+·|$)/);
      if (aboutMatch) {
        about = aboutMatch[1].trim();
        // Remove "…" ou "..." no final
        about = about.replace(/[…\.]{1,3}$/, '').trim();
      }

      // Extrai Experience/Empresa
      const experienceMatch = ogDescription.match(/Experience:\s*([^·]+)/i);
      if (experienceMatch) {
        company = experienceMatch[1].trim();
      }

      // Extrai Education
      const educationMatch = ogDescription.match(/Education:\s*([^·]+)/i);
      if (educationMatch) {
        education = educationMatch[1].trim();
      }

      // Extrai Location
      const locationMatch = ogDescription.match(/Location:\s*([^·]+)/i);
      if (locationMatch) {
        location = locationMatch[1].trim();
      }

      // Extrai Conexões
      const connectionsMatch = ogDescription.match(/(\d+\+?)\s+connections/i);
      if (connectionsMatch) {
        connections = connectionsMatch[1];
      }
    }

    // Extrai Position do título (se existir)
    if (titleParts.length > 1) {
      const titlePosition = titleParts[1].replace('LinkedIn', '').replace('|', '').trim();
      if (titlePosition) {
        // Parse "Cargo at Empresa"
        const posCompMatch = titlePosition.match(/(.+?)\s+at\s+(.+)/i);
        if (posCompMatch) {
          position = posCompMatch[1].trim();
          if (!company) {
            company = posCompMatch[2].trim();
          }
        } else {
          position = titlePosition;
        }
      }
    }

    // Se não encontrou position, usa about como headline
    const headline = position || about || '';

    console.log('✅ Dados parseados:', {
      name,
      position,
      company,
      education,
      location,
      connections,
      about: about?.substring(0, 50) + '...'
    });

    const profileData: LinkedInData = {
      fullName: name,
      firstName,
      lastName,
      headline,
      position,
      company,
      location,
      education,
      connections,
      about,
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

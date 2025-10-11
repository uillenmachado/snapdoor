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
        JSON.stringify({ error: 'LinkedIn URL é obrigatória', success: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Extraindo dados do LinkedIn:', linkedinUrl);

    // Tenta requisição direta primeiro
    let html: string | null = null;
    let response = await fetch(linkedinUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    console.log('📡 Status da resposta LinkedIn (tentativa direta):', response.status);

    if (response.ok) {
      html = await response.text();
    } else {
      // FALLBACK: Tenta via proxy público (allorigins.win)
      console.log('🔄 Tentando via proxy público...');
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(linkedinUrl)}`;
      
      response = await fetch(proxyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.ok) {
        html = await response.text();
        console.log('✅ Proxy funcionou!');
      } else {
        console.error('❌ LinkedIn bloqueou ambas tentativas');
        return new Response(
          JSON.stringify({ 
            error: 'Perfil não acessível', 
            success: false,
            details: `LinkedIn bloqueou acesso (status ${response.status})` 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!html) {
      return new Response(
        JSON.stringify({ error: 'Não foi possível obter conteúdo do perfil', success: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
        JSON.stringify({ error: 'Não foi possível extrair dados do perfil', success: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        const posCompMatch = titlePosition.match(/(.+?)\s+(?:at|na|em)\s+(.+)/i);
        if (posCompMatch) {
          position = posCompMatch[1].trim();
          // Só sobrescreve company se não foi extraído da Experience
          if (!company || company === posCompMatch[2].trim()) {
            company = posCompMatch[2].trim();
          }
        } else {
          // Se não tem "at", pode ser só o nome da empresa (não o cargo)
          // Verifica se parece com um cargo antes de assumir
          const jobKeywords = /manager|specialist|director|engineer|developer|analyst|coordinator|lead|head|officer|designer|consultant|executive|founder|ceo|cto|cfo/i;
          if (jobKeywords.test(titlePosition)) {
            position = titlePosition;
          } else {
            // É só o nome da empresa, não o cargo
            if (!company) {
              company = titlePosition;
            }
          }
        }
      }
    }

    // Se não encontrou position ainda, tenta extrair do "about" (primeira parte da descrição)
    if (!position && about) {
      // Padrões comuns: "I am a [cargo]", "Experienced [cargo]", ou direto o cargo
      const aboutPositionMatch = about.match(/(?:I am an?|I'm an?|Experienced?)\s+(.+?)(?:\s+(?:focused|specialized|with|at)|$)/i);
      if (aboutPositionMatch) {
        position = aboutPositionMatch[1].trim();
      } else {
        // Se não encontrou padrão, verifica se o about começa com palavras de cargo
        const jobKeywords = /^(?:Senior|Junior|Lead|Principal|Staff|Head of|Director of|Manager|Specialist|Engineer|Developer|Designer|Analyst|Consultant|Coordinator)/i;
        if (jobKeywords.test(about)) {
          // Pega só a primeira frase/linha como cargo
          const firstSentence = about.split(/[.!?]/)[0].trim();
          if (firstSentence.length < 100) { // Evita pegar texto muito longo
            position = firstSentence;
          }
        }
      }
    }

    // Se não encontrou position, usa about como headline (mas NÃO como position)
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
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

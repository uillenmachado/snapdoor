// =====================================================
// SUPABASE EDGE FUNCTION: IMPORT LINKEDIN PROFILE
// Importa perfis do LinkedIn e cria leads automaticamente
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LinkedInProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  headline: string;
  company: string;
  location: string;
  profilePicture?: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startYear?: number;
    endYear?: number;
  }>;
  skills: string[];
  connections?: number;
  about?: string;
  profileUrl: string;
}

// Função para extrair dados do LinkedIn (simulação - em produção usar scraping real)
async function scrapeLinkedInProfile(url: string): Promise<LinkedInProfile> {
  // Em produção, isso faria scraping real ou usaria API do LinkedIn
  // Por enquanto, vamos simular com dados de exemplo
  
  // Validar URL
  if (!url.includes('linkedin.com')) {
    throw new Error('URL inválida do LinkedIn')
  }

  // Simular delay de scraping
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Extrair nome do perfil da URL
  const profileSlug = url.split('/in/')[1]?.split('/')[0] || 'unknown'

  // Retornar dados simulados (em produção, fazer scraping real)
  return {
    fullName: "João Silva",
    firstName: "João",
    lastName: "Silva",
    headline: "Software Engineer @ TechCorp",
    company: "TechCorp",
    location: "São Paulo, Brasil",
    profilePicture: `https://i.pravatar.cc/150?u=${profileSlug}`,
    experience: [
      {
        title: "Senior Software Engineer",
        company: "TechCorp",
        startDate: "2022-01",
        description: "Desenvolvendo soluções em escala"
      }
    ],
    education: [
      {
        school: "Universidade de São Paulo",
        degree: "Bacharelado",
        field: "Ciência da Computação",
        startYear: 2015,
        endYear: 2019
      }
    ],
    skills: ["JavaScript", "TypeScript", "React", "Node.js"],
    connections: 500,
    about: "Apaixonado por tecnologia e inovação",
    profileUrl: url,
  }
}

// Calcular lead score baseado nos dados do perfil
function calculateLeadScore(profile: LinkedInProfile): number {
  let score = 0

  // Pontos por conexões (max 20 pontos)
  if (profile.connections) {
    score += Math.min(Math.floor(profile.connections / 50), 20)
  }

  // Pontos por experiência (max 25 pontos)
  score += Math.min(profile.experience.length * 5, 25)

  // Pontos por educação (max 15 pontos)
  score += Math.min(profile.education.length * 7.5, 15)

  // Pontos por skills (max 20 pontos)
  score += Math.min(profile.skills.length * 2, 20)

  // Pontos por ter about preenchido (10 pontos)
  if (profile.about && profile.about.length > 50) {
    score += 10
  }

  // Pontos por ter headline descritivo (10 pontos)
  if (profile.headline && profile.headline.length > 20) {
    score += 10
  }

  return Math.min(Math.round(score), 100)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Parse request
    const { linkedinUrl, stageId, createLead = true } = await req.json()

    if (!linkedinUrl) {
      return new Response(
        JSON.stringify({ error: 'URL do LinkedIn é obrigatória' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if profile already imported
    const { data: existingImport } = await supabaseClient
      .from('linkedin_imports')
      .select('*')
      .eq('linkedin_url', linkedinUrl)
      .eq('user_id', user.id)
      .single()

    if (existingImport) {
      return new Response(
        JSON.stringify({ 
          error: 'Perfil já importado anteriormente',
          existingImport 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      )
    }

    // Scrape LinkedIn profile
    console.log('Scraping LinkedIn profile:', linkedinUrl)
    const profileData = await scrapeLinkedInProfile(linkedinUrl)

    // Calculate lead score
    const leadScore = calculateLeadScore(profileData)

    // Create import record
    const { data: importRecord, error: importError } = await supabaseClient
      .from('linkedin_imports')
      .insert({
        user_id: user.id,
        linkedin_url: linkedinUrl,
        profile_data: profileData,
        import_status: 'completed',
      })
      .select()
      .single()

    if (importError) {
      throw importError
    }

    // Create lead if requested
    let lead = null
    if (createLead && stageId) {
      // Extract tags from skills
      const tags = profileData.skills.slice(0, 5)

      const { data: newLead, error: leadError } = await supabaseClient
        .from('leads')
        .insert({
          user_id: user.id,
          stage_id: stageId,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          job_title: profileData.headline,
          company: profileData.company,
          linkedin_url: linkedinUrl,
          linkedin_profile_data: profileData,
          profile_picture_url: profileData.profilePicture,
          tags,
          lead_score: leadScore,
          source: 'linkedin_import',
        })
        .select()
        .single()

      if (leadError) {
        console.error('Error creating lead:', leadError)
      } else {
        lead = newLead

        // Update import record with lead_id
        await supabaseClient
          .from('linkedin_imports')
          .update({ lead_id: newLead.id })
          .eq('id', importRecord.id)

        // Create initial activity
        await supabaseClient
          .from('activities')
          .insert({
            lead_id: newLead.id,
            user_id: user.id,
            type: 'linkedin_visit',
            description: 'Lead importado do LinkedIn',
            metadata: {
              connections: profileData.connections,
              location: profileData.location,
            },
          })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        profileData,
        leadScore,
        lead,
        import: importRecord,
        suggestedLead: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          jobTitle: profileData.headline,
          company: profileData.company,
          tags: profileData.skills.slice(0, 5),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})



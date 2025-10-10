// =====================================================
// SUPABASE EDGE FUNCTION: BULK IMPORT LINKEDIN
// Importa múltiplos perfis do LinkedIn em lote
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkImportResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    url: string;
    status: 'success' | 'error' | 'duplicate';
    leadId?: string;
    error?: string;
  }>;
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
    const { linkedinUrls, stageId, rateLimitDelay = 2000 } = await req.json()

    if (!linkedinUrls || !Array.isArray(linkedinUrls) || linkedinUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Array de URLs do LinkedIn é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (linkedinUrls.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Máximo de 50 URLs por lote' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!stageId) {
      return new Response(
        JSON.stringify({ error: 'Stage ID é obrigatório' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const result: BulkImportResult = {
      total: linkedinUrls.length,
      successful: 0,
      failed: 0,
      results: [],
    }

    // Process each URL with rate limiting
    for (const url of linkedinUrls) {
      try {
        // Call single import function
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/import-linkedin-profile`,
          {
            method: 'POST',
            headers: {
              'Authorization': req.headers.get('Authorization')!,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              linkedinUrl: url,
              stageId,
              createLead: true,
            }),
          }
        )

        const data = await response.json()

        if (response.ok) {
          result.successful++
          result.results.push({
            url,
            status: 'success',
            leadId: data.lead?.id,
          })
        } else if (response.status === 409) {
          // Duplicate
          result.results.push({
            url,
            status: 'duplicate',
            error: 'Perfil já importado',
          })
        } else {
          result.failed++
          result.results.push({
            url,
            status: 'error',
            error: data.error || 'Erro desconhecido',
          })
        }
      } catch (error) {
        result.failed++
        result.results.push({
          url,
          status: 'error',
          error: error.message,
        })
      }

      // Rate limiting delay between requests
      if (linkedinUrls.indexOf(url) < linkedinUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay))
      }
    }

    // Create analytics event
    await supabaseClient
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type: 'bulk_linkedin_import',
        event_data: {
          total: result.total,
          successful: result.successful,
          failed: result.failed,
        },
      })

    return new Response(
      JSON.stringify(result),
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



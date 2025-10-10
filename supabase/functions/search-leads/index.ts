// =====================================================
// SUPABASE EDGE FUNCTION: SEARCH LEADS
// Busca avançada de leads com filtros, paginação e analytics
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchParams {
  search?: string;
  stageId?: string;
  tags?: string[];
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'updated_at' | 'lead_score' | 'first_name';
  sortOrder?: 'asc' | 'desc';
  includeArchived?: boolean;
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

    // Parse request body
    const params: SearchParams = await req.json()
    const {
      search,
      stageId,
      tags,
      minScore,
      maxScore,
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'desc',
      includeArchived = false,
    } = params

    // Build query
    let query = supabaseClient
      .from('leads')
      .select('*, stages(name, color)', { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (stageId) {
      query = query.eq('stage_id', stageId)
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    if (minScore !== undefined) {
      query = query.gte('lead_score', minScore)
    }

    if (maxScore !== undefined) {
      query = query.lte('lead_score', maxScore)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: leads, error: leadsError, count } = await query

    if (leadsError) {
      throw leadsError
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    // Get aggregated stats
    const { data: stats } = await supabaseClient
      .from('leads')
      .select('stage_id, lead_score')
      .eq('user_id', user.id)
      .eq('is_archived', false)

    const statsByStage = stats?.reduce((acc: Record<string, number>, lead) => {
      acc[lead.stage_id] = (acc[lead.stage_id] || 0) + 1
      return acc
    }, {}) || {}

    const avgScore = stats?.length 
      ? stats.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / stats.length 
      : 0

    return new Response(
      JSON.stringify({
        leads,
        pagination: {
          total: count || 0,
          pages: totalPages,
          current: page,
          limit,
          hasNext,
          hasPrev,
        },
        stats: {
          totalLeads: count || 0,
          byStage: statsByStage,
          avgScore: Math.round(avgScore),
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



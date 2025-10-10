// =====================================================
// SUPABASE EDGE FUNCTION: GET ANALYTICS
// Retorna analytics e métricas do dashboard
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const url = new URL(req.url)
    const period = url.searchParams.get('period') || '30' // dias
    const periodDays = parseInt(period)

    // Get total leads
    const { count: totalLeads } = await supabaseClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_archived', false)

    // Get leads created in period
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - periodDays)

    const { count: leadsThisPeriod } = await supabaseClient
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .gte('created_at', periodStart.toISOString())

    // Get leads per stage
    const { data: leadsData } = await supabaseClient
      .from('leads')
      .select('stage_id, stages(name)')
      .eq('user_id', user.id)
      .eq('is_archived', false)

    const leadsPerStage = leadsData?.reduce((acc: Record<string, any>, lead: any) => {
      const stageName = lead.stages?.name || 'Sem etapa'
      acc[stageName] = (acc[stageName] || 0) + 1
      return acc
    }, {}) || {}

    // Get leads over time (last 30 days)
    const { data: leadsOverTime } = await supabaseClient
      .from('leads')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: true })

    // Group by date
    const timeSeriesData = leadsOverTime?.reduce((acc: Record<string, number>, lead) => {
      const date = new Date(lead.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}) || {}

    const formattedTimeSeries = Object.entries(timeSeriesData).map(([date, count]) => ({
      date,
      count,
    }))

    // Get top sources
    const { data: sourcesData } = await supabaseClient
      .from('leads')
      .select('source')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .not('source', 'is', null)

    const topSources = sourcesData?.reduce((acc: Record<string, number>, lead) => {
      const source = lead.source || 'Desconhecido'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {}) || {}

    const formattedSources = Object.entries(topSources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get activities this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    const { count: activitiesThisWeek } = await supabaseClient
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', weekStart.toISOString())

    // Calculate average lead score
    const { data: scoresData } = await supabaseClient
      .from('leads')
      .select('lead_score')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .not('lead_score', 'is', null)

    const avgScore = scoresData?.length
      ? Math.round(scoresData.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / scoresData.length)
      : 0

    // Get conversion rate (leads que chegaram ao último stage)
    const { data: stages } = await supabaseClient
      .from('stages')
      .select('id, position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)

    let conversionRate = 0
    if (stages && stages.length > 0) {
      const finalStageId = stages[0].id
      const { count: convertedLeads } = await supabaseClient
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('stage_id', finalStageId)

      if (totalLeads && totalLeads > 0) {
        conversionRate = Math.round(((convertedLeads || 0) / totalLeads) * 100)
      }
    }

    // Get pending activities
    const { count: pendingActivities } = await supabaseClient
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', false)
      .not('scheduled_at', 'is', null)

    return new Response(
      JSON.stringify({
        totalLeads: totalLeads || 0,
        leadsThisPeriod: leadsThisPeriod || 0,
        conversionRate,
        avgScore,
        leadsPerStage,
        leadsOverTime: formattedTimeSeries,
        topSources: formattedSources,
        activitiesThisWeek: activitiesThisWeek || 0,
        pendingActivities: pendingActivities || 0,
        period: periodDays,
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



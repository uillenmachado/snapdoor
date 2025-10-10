// =====================================================
// SUPABASE EDGE FUNCTION: CREATE AUTOMATION
// Cria e gerencia automações de workflow
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutomationAction {
  type: 'send_email' | 'create_activity' | 'move_to_stage' | 'add_tag' | 'send_notification' | 'create_task';
  config: Record<string, any>;
  delay?: number; // em horas
}

interface AutomationTrigger {
  type: 'lead_created' | 'lead_moved_stage' | 'note_added' | 'activity_completed' | 'time_passed';
  config: Record<string, any>;
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

    const method = req.method

    if (method === 'GET') {
      // List automations
      const { data: automations, error } = await supabaseClient
        .from('automations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({ automations }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else if (method === 'POST') {
      // Create automation
      const { name, description, triggerType, triggerConfig, actions, isActive = true } = await req.json()

      if (!name || !triggerType || !actions || !Array.isArray(actions)) {
        return new Response(
          JSON.stringify({ error: 'Campos obrigatórios: name, triggerType, actions' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { data: automation, error } = await supabaseClient
        .from('automations')
        .insert({
          user_id: user.id,
          name,
          description,
          trigger_type: triggerType,
          trigger_config: triggerConfig || {},
          actions,
          is_active: isActive,
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ automation }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      )
    } else if (method === 'PUT') {
      // Update automation
      const { id, name, description, triggerType, triggerConfig, actions, isActive } = await req.json()

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'ID da automação é obrigatório' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const updates: Record<string, any> = {}
      if (name !== undefined) updates.name = name
      if (description !== undefined) updates.description = description
      if (triggerType !== undefined) updates.trigger_type = triggerType
      if (triggerConfig !== undefined) updates.trigger_config = triggerConfig
      if (actions !== undefined) updates.actions = actions
      if (isActive !== undefined) updates.is_active = isActive

      const { data: automation, error } = await supabaseClient
        .from('automations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ automation }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else if (method === 'DELETE') {
      // Delete automation
      const url = new URL(req.url)
      const id = url.searchParams.get('id')

      if (!id) {
        return new Response(
          JSON.stringify({ error: 'ID da automação é obrigatório' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { error } = await supabaseClient
        .from('automations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
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



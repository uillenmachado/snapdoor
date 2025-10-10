// =====================================================
// SHARED: Authentication Utilities
// Funções reutilizáveis para autenticação
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getAuthenticatedUser(req: Request) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error('Não autorizado');
  }

  return { user, supabase: supabaseClient };
}

export function createAuthError() {
  return new Response(
    JSON.stringify({ error: 'Não autorizado' }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 401,
    }
  );
}



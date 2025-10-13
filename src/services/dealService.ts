/**
 * Serviço de gerenciamento de deals
 * Funções para CRUD, movimentação no kanban e estatísticas
 */

// @ts-nocheck - Tipos do Supabase precisam ser regenerados após migration de deals
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealFormData, DealFilters } from '@/types/deal';

/**
 * Buscar deals com filtros e paginação
 */
export async function fetchDeals(
  filters?: DealFilters,
  page = 1,
  pageSize = 50
): Promise<{ data: Deal[]; count: number }> {
  let query = supabase
    .from('deals')
    .select('*', { count: 'exact' });

  // Aplicar busca
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Aplicar filtros
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id);
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }

  if (filters?.stage_id) {
    query = query.eq('stage_id', filters.stage_id);
  }

  if (filters?.min_value !== undefined) {
    query = query.gte('value', filters.min_value);
  }

  if (filters?.max_value !== undefined) {
    query = query.lte('value', filters.max_value);
  }

  // Aplicar ordenação
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Aplicar paginação
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Erro ao buscar deals:', error);
    throw new Error(`Erro ao buscar deals: ${error.message}`);
  }

  return { data: (data || []) as Deal[], count: count || 0 };
}

/**
 * Buscar deals de um pipeline específico (agrupados por stage)
 */
export async function fetchDealsByPipeline(pipelineId: string) {
  // Buscar stages do pipeline
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true });

  if (stagesError) {
    console.error('Erro ao buscar stages:', stagesError);
    throw new Error(`Erro ao buscar stages: ${stagesError.message}`);
  }

  // Buscar deals de cada stage
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .eq('status', 'open') // Apenas deals abertos no kanban
    .order('position', { ascending: true });

  if (dealsError) {
    console.error('Erro ao buscar deals:', dealsError);
    throw new Error(`Erro ao buscar deals: ${dealsError.message}`);
  }

  // Agrupar deals por stage
  const stagesWithDeals = stages?.map(stage => ({
    ...stage,
    deals: (deals || []).filter(deal => deal.stage_id === stage.id),
  })) || [];

  return stagesWithDeals;
}

/**
 * Buscar deal por ID
 */
export async function fetchDealById(id: string): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar deal:', error);
    throw new Error(`Erro ao buscar deal: ${error.message}`);
  }

  if (!data) {
    throw new Error('Deal não encontrado');
  }

  return data as Deal;
}

/**
 * Criar novo deal
 */
export async function createDeal(
  dealData: DealFormData & { stage_id: string; pipeline_id: string }
): Promise<Deal> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // Buscar próxima posição no stage
  const { count } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('stage_id', dealData.stage_id);

  const { data, error } = await supabase
    .from('deals')
    .insert([{
      ...dealData,
      user_id: user.id,
      position: count || 0,
      status: dealData.status || 'open',
      probability: dealData.probability || 50,
      currency: dealData.currency || 'BRL',
      value: dealData.value || 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar deal:', error);
    throw new Error(`Erro ao criar deal: ${error.message}`);
  }

  return data as Deal;
}

/**
 * Atualizar deal existente
 */
export async function updateDeal(
  id: string,
  updates: Partial<DealFormData>
): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar deal:', error);
    throw new Error(`Erro ao atualizar deal: ${error.message}`);
  }

  return data as Deal;
}

/**
 * Deletar deal
 */
export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar deal:', error);
    throw new Error(`Erro ao deletar deal: ${error.message}`);
  }
}

/**
 * Mover deal para outro stage ou reordenar
 */
export async function moveDeal(
  dealId: string,
  newStageId: string,
  newPosition: number
): Promise<Deal> {
  // Buscar deal atual
  const { data: currentDeal } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();

  if (!currentDeal) {
    throw new Error('Deal não encontrado');
  }

  // Se mudou de stage, atualizar posições
  if (currentDeal.stage_id !== newStageId) {
    // Decrementar posição dos deals no stage antigo
    await supabase
      .from('deals')
      .update({ position: supabase.rpc('position - 1') })
      .eq('stage_id', currentDeal.stage_id)
      .gt('position', currentDeal.position);

    // Incrementar posição dos deals no novo stage
    await supabase
      .from('deals')
      .update({ position: supabase.rpc('position + 1') })
      .eq('stage_id', newStageId)
      .gte('position', newPosition);
  } else {
    // Reordenar no mesmo stage
    if (newPosition > currentDeal.position) {
      // Movendo para baixo
      await supabase
        .from('deals')
        .update({ position: supabase.rpc('position - 1') })
        .eq('stage_id', currentDeal.stage_id)
        .gt('position', currentDeal.position)
        .lte('position', newPosition);
    } else if (newPosition < currentDeal.position) {
      // Movendo para cima
      await supabase
        .from('deals')
        .update({ position: supabase.rpc('position + 1') })
        .eq('stage_id', currentDeal.stage_id)
        .gte('position', newPosition)
        .lt('position', currentDeal.position);
    }
  }

  // Atualizar o deal movido
  const { data, error } = await supabase
    .from('deals')
    .update({
      stage_id: newStageId,
      position: newPosition,
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao mover deal:', error);
    throw new Error(`Erro ao mover deal: ${error.message}`);
  }

  return data as Deal;
}

/**
 * Buscar estatísticas de deals
 */
export async function fetchDealStats(pipelineId?: string) {
  let query = supabase
    .from('deals')
    .select('status, value, probability');

  if (pipelineId) {
    query = query.eq('pipeline_id', pipelineId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      totalDeals: 0,
      totalValue: 0,
      weightedValue: 0,
      openDeals: 0,
      wonDeals: 0,
      lostDeals: 0,
      averageValue: 0,
      winRate: 0,
    };
  }

  const deals = data || [];
  const openDeals = deals.filter(d => d.status === 'open');
  const wonDeals = deals.filter(d => d.status === 'won');
  const lostDeals = deals.filter(d => d.status === 'lost');

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedValue = openDeals.reduce(
    (sum, d) => sum + ((d.value || 0) * (d.probability || 0)) / 100,
    0
  );

  return {
    totalDeals: deals.length,
    totalValue,
    weightedValue,
    openDeals: openDeals.length,
    wonDeals: wonDeals.length,
    lostDeals: lostDeals.length,
    averageValue: deals.length > 0 ? totalValue / deals.length : 0,
    winRate: wonDeals.length + lostDeals.length > 0
      ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
      : 0,
  };
}

/**
 * Marcar deal como ganho
 */
export async function markDealAsWon(dealId: string): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .update({
      status: 'won',
      closed_date: new Date().toISOString(),
      probability: 100,
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao marcar deal como ganho:', error);
    throw new Error(`Erro ao marcar deal como ganho: ${error.message}`);
  }

  return data as Deal;
}

/**
 * Marcar deal como perdido
 */
export async function markDealAsLost(dealId: string, reason?: string): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .update({
      status: 'lost',
      closed_date: new Date().toISOString(),
      lost_reason: reason,
      probability: 0,
    })
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao marcar deal como perdido:', error);
    throw new Error(`Erro ao marcar deal como perdido: ${error.message}`);
  }

  return data as Deal;
}

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://cfydbvrzjtbcrbzimfjm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWRidnJ6anRiY3JiemltZmptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA4OTMwOSwiZXhwIjoyMDc1NjY1MzA5fQ.AwCiWyYu8loceV-MPXiwRBySJ5q3f2fBnMwEDyXZ9CI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runDiagnostics() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO SISTEMA\n')
  console.log('='.repeat(80))

  // Teste 1: Leads com Companies
  console.log('\n📊 TESTE 1: LEADS COM EMPRESAS (JOIN)')
  console.log('-'.repeat(80))
  
  const { data: leadsData, error: leadsError } = await supabase
    .from('leads')
    .select(`
      id,
      first_name,
      last_name,
      company_id,
      title,
      headline,
      companies:company_id (
        id,
        name
      )
    `)
    .limit(10)

  if (leadsError) {
    console.error('❌ Erro ao buscar leads:', leadsError.message)
  } else {
    console.table(leadsData?.map(lead => ({
      Nome: `${lead.first_name} ${lead.last_name}`,
      'Company ID': lead.company_id?.substring(0, 8) + '...',
      'Empresa': lead.companies?.name || '❌ NULL',
      'Cargo': lead.title || lead.headline || '-',
      'Status': lead.companies?.name ? '✅ OK' : '❌ SEM EMPRESA'
    })))
  }

  // Teste 2: Deals com Stages
  console.log('\n📊 TESTE 2: DEALS COM STAGES (JOIN)')
  console.log('-'.repeat(80))
  
  const { data: dealsData, error: dealsError } = await supabase
    .from('deals')
    .select(`
      id,
      title,
      stage_id,
      stages:stage_id (
        id,
        name,
        position
      )
    `)
    .limit(10)

  if (dealsError) {
    console.error('❌ Erro ao buscar deals:', dealsError.message)
  } else {
    console.table(dealsData?.map(deal => ({
      'Deal': deal.title,
      'Stage ID': deal.stage_id?.substring(0, 8) + '...',
      'Stage': deal.stages?.name || '❌ NULL',
      'Posição': deal.stages?.position || '-',
      'Status': deal.stages?.name ? '✅ OK' : '❌ SEM STAGE'
    })))
  }

  // Teste 3: Resumo
  console.log('\n📊 TESTE 3: RESUMO GERAL')
  console.log('-'.repeat(80))
  
  const leadsComEmpresa = leadsData?.filter(l => l.companies?.name).length || 0
  const leadsSemEmpresa = (leadsData?.length || 0) - leadsComEmpresa
  const dealsComStage = dealsData?.filter(d => d.stages?.name).length || 0
  const dealsSemStage = (dealsData?.length || 0) - dealsComStage

  console.table([
    { Métrica: 'Total de Leads', Quantidade: leadsData?.length || 0 },
    { Métrica: 'Leads COM empresa (JOIN OK)', Quantidade: leadsComEmpresa },
    { Métrica: 'Leads SEM empresa (JOIN FALHOU)', Quantidade: leadsSemEmpresa },
    { Métrica: '', Quantidade: '' },
    { Métrica: 'Total de Deals', Quantidade: dealsData?.length || 0 },
    { Métrica: 'Deals COM stage (JOIN OK)', Quantidade: dealsComStage },
    { Métrica: 'Deals SEM stage (JOIN FALHOU)', Quantidade: dealsSemStage },
  ])

  console.log('\n' + '='.repeat(80))
  console.log('\n✅ Diagnóstico completo!')
  
  if (leadsSemEmpresa > 0 || dealsSemStage > 0) {
    console.log('\n⚠️  PROBLEMA IDENTIFICADO:')
    if (leadsSemEmpresa > 0) {
      console.log(`   - ${leadsSemEmpresa} leads não retornaram dados da empresa via JOIN`)
      console.log('   - Possível causa: RLS bloqueando acesso à tabela companies')
    }
    if (dealsSemStage > 0) {
      console.log(`   - ${dealsSemStage} deals não retornaram dados do stage via JOIN`)
      console.log('   - Possível causa: RLS bloqueando acesso à tabela stages')
    }
  } else {
    console.log('\n✅ TODOS OS JOINS ESTÃO FUNCIONANDO CORRETAMENTE!')
    console.log('   - O problema deve estar no código React (renderização)')
  }
}

runDiagnostics().catch(console.error)

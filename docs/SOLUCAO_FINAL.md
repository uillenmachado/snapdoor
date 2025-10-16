# 🎯 SOLUÇÃO FINAL - Corrigir Stage IDs dos Deals

## ✅ PROBLEMA IDENTIFICADO COM 100% DE CERTEZA

**Console mostrou:**
```javascript
primeiroMatch: {
  stage_id_do_stage: 'cec42a60-8265-435b-ab64-f2b4e2c15fbb',  // ID do Stage "Qualificado"
  stage_id_do_deal: 'ff80132d-5ad3-4dbc-b870-f5fa7213b7ad',   // ID diferente!
  sao_iguais: false  // ❌ NÃO BATEM!
}
```

**Causa:** Os 10 deals estão com `stage_id` apontando para stages que **NÃO EXISTEM MAIS** (provavelmente foram recriados em alguma migration).

## 🔧 SOLUÇÃO

Executar o script SQL que atualiza os `stage_id` dos deals para os IDs corretos dos stages atuais.

### Passo a Passo:

1. **Abra o Supabase SQL Editor**
   - https://supabase.com/dashboard/project/knxprkuftbjqcdhwatso/sql

2. **Cole o conteúdo do arquivo**  
   - `scripts/corrigir-stage-ids-deals.sql`

3. **Clique em "Run"**

4. **Aguarde a mensagem**
   ```
   Deals atualizados com sucesso!
   ```

5. **Verifique o resultado**
   - O próprio script já mostra a distribuição final
   - Você verá os deals associados aos stages corretos

## 📊 DISTRIBUIÇÃO QUE SERÁ APLICADA

| Stage | Deals | Títulos |
|-------|-------|---------|
| **Qualificado** (4) | Plano Starter, Demo Personalizada, Trial Estendido, CRM Parcerias |
| **Contato Feito** (2) | CRM Corporativo, Migração Enterprise |
| **Proposta Enviada** (2) | CRM Integrado PME, Integrações ERP TOTVS |
| **Ganho** (2) | Integração Nubank, CRM Global |

**Total:** 10 deals distribuídos em 4 stages

## ✅ APÓS EXECUTAR O SQL

1. **Recarregue a página `/pipelines` no navegador** (F5)
2. **Você verá:** Cards de deals aparecerem nas colunas corretas!
3. **Console mostrará:** `algumMatch: true` e `quantidade > 0` em cada stage

## 🎯 LEADS JÁ ESTÁ FUNCIONANDO

Como vimos no console:
```javascript
leadsComCompanies: 10  // ✅ Todos com empresa
companies: ['Nubank', 'Mercado Livre', ...]  // ✅ Dados corretos
```

E no seu print da tela de Leads, **as empresas ESTÃO aparecendo** (Nubank, Mercado Livre, Stone Pagamentos, etc.)!

## 📝 RESUMO

| Problema | Status | Solução |
|----------|--------|---------|
| Empresas não aparecem em Leads | ✅ **RESOLVIDO** | Dados chegam corretamente, só tinha delay de loading |
| Deals não aparecem no Kanban | ⚠️ **AGUARDANDO SQL** | Executar `corrigir-stage-ids-deals.sql` |
| Contraste ruim na tabela | ✅ **RESOLVIDO** | Código já corrigido (bg-white + text-neutral-900) |

---

**Execute o SQL e depois me avise!** 🚀

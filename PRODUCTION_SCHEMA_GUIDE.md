# 🚀 PRODUCTION SCHEMA - GUIA DE EXECUÇÃO

## ✅ O QUE FOI CRIADO

### 📊 Schema Completo Production-Ready

**Arquivo:** `PRODUCTION_SCHEMA_MASTER.sql` (1000+ linhas)

---

## 🎯 ESTRUTURA COMPLETA

### 1️⃣ **TABELAS CORE EXPANDIDAS**

#### ✅ profiles
- **Novos campos:** timezone, language, role, is_active, onboarding, last_seen_at, metadata
- **Total:** 20+ campos profissionais

#### ✅ leads  
- **Enriquecimento:** LinkedIn (headline, about, connections, education, experience, skills)
- **Tracking:** lead_score, status, source, tags, custom_fields, notes_count, activities_count
- **Empresa:** company_id, company_size, company_industry, company_location
- **Total:** 40+ campos

#### ✅ companies
- **Expandido:** domain, industry, size, revenue, employee_count, is_customer
- **Social:** linkedin_url, twitter_url, facebook_url
- **Total:** 25+ campos

#### ✅ deals
- **Forecast:** forecast_category, weighted_value, actual_close_date
- **Tracking:** days_in_stage, days_to_close, competitors, products_services
- **Total:** 30+ campos

#### ✅ activities
- **Expandido:** company_id, deal_id, status, priority, due_date, assigned_to
- **Meeting:** participants, duration_minutes, location, meeting_url
- **Total:** 25+ campos

---

### 2️⃣ **NOVAS TABELAS CRIADAS**

| Tabela | Descrição | Campos Principais |
|--------|-----------|-------------------|
| **notifications** | Notificações em tempo real | type, title, message, entity_type, is_read |
| **tasks** | Tarefas com checklist | title, status, priority, checklist, assigned_to |
| **webhooks** | Integrações webhook | url, events, secret_key, trigger_count |
| **email_templates** | Templates reutilizáveis | subject, body_html, category, variables |
| **integrations** | Zapier, Make, N8N | provider, config, credentials, sync_status |
| **api_keys** | Acesso programático | key_hash, scopes, rate_limit, expires_at |
| **audit_logs** | Rastreamento completo | action, entity_type, old_values, new_values |
| **saved_filters** | Filtros favoritos | entity_type, filters, is_shared |
| **custom_fields** | Campos customizados | field_type, validation_rules, options |

**Total:** 9 novas tabelas profissionais

---

### 3️⃣ **RLS POLICIES COMPLETAS**

✅ **Todas as tabelas protegidas**
- notifications: view/update/delete próprias
- tasks: view próprias ou assigned
- webhooks: manage próprias
- email_templates: manage próprias
- integrations: manage próprias
- api_keys: manage próprias
- audit_logs: view próprias
- saved_filters: manage próprias
- custom_fields: manage próprias

✅ **Profiles:** INSERT permitido (signup), UPDATE próprio

---

### 4️⃣ **INDEXES OTIMIZADOS**

#### Performance Indexes (30+):
- **profiles:** email, role, is_active
- **leads:** user_id, status, source, lead_score, company_id, created_at
- **companies:** domain, name (trigram), user_id
- **deals:** status, value, expected_close_date
- **activities:** user_id, lead_id, deal_id, status, due_date
- **tasks:** user_id, assigned_to, status, due_date
- **notifications:** user_id + created_at, is_read
- **audit_logs:** user_id + created_at, entity

#### Trigram Indexes (busca fuzzy):
- leads.email
- leads.company
- companies.name

---

### 5️⃣ **TRIGGERS & FUNCTIONS**

#### ✅ Auto Update Triggers:
- `update_updated_at_column()` aplicado em 12 tabelas

#### ✅ Audit Log Triggers:
- Rastreia INSERT/UPDATE/DELETE em leads, deals, companies, subscriptions, credits

#### ✅ Business Logic:
- `calculate_deal_weighted_value()` - value * probability
- `update_user_last_seen()` - tracking de atividade

#### ✅ Helper Functions:
- `create_notification()` - criar notificações
- `find_duplicate_leads()` - buscar duplicatas
- `merge_leads()` - merge com histórico
- `bulk_archive_leads()` - arquivar em massa
- `bulk_update_lead_status()` - update em massa
- `get_user_statistics()` - dashboard stats

---

### 6️⃣ **ANALYTICS VIEWS**

✅ **deals_pipeline_view**
- Join completo: deals + stages + pipelines + companies + users
- Visualização pronta para dashboard

✅ **lead_conversion_funnel**
- Funil completo: new → contacted → qualified → converted
- Conversion rate automático

✅ **activities_summary**
- Resumo diário por tipo
- Completed count + overdue count

---

### 7️⃣ **REALTIME**

✅ **Publicações habilitadas:**
- notifications (notificações ao vivo)
- tasks (sincronização de tarefas)
- activities (timeline em tempo real)

---

## 📋 COMO EXECUTAR

### Opção 1: Supabase Dashboard SQL Editor (RECOMENDADO)

1. **Abrir:** https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql
2. **Copiar:** Todo o conteúdo de `PRODUCTION_SCHEMA_MASTER.sql`
3. **Colar:** No SQL Editor
4. **Executar:** Clicar "Run" (Ctrl+Enter)
5. **Aguardar:** ~30-60 segundos
6. **Verificar:** Deve mostrar "Schema Production-Ready Completo!" + contagem de tabelas

### Opção 2: Via CLI (se configurado)

```powershell
# Na raiz do projeto
npx supabase db push
```

---

## ✅ VERIFICAÇÃO PÓS-EXECUÇÃO

### 1. Verificar Tabelas Criadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'notifications', 'tasks', 'webhooks', 'email_templates',
  'integrations', 'api_keys', 'audit_logs', 'saved_filters', 'custom_fields'
)
ORDER BY table_name;
```

**Resultado esperado:** 9 tabelas

### 2. Verificar Indexes

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename;
```

**Resultado esperado:** 30+ indexes

### 3. Verificar RLS Policies

```sql
SELECT tablename, COUNT(*) as policies_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Resultado esperado:** Todas as tabelas com policies

### 4. Verificar Functions

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
AND routine_name IN (
  'create_notification', 'find_duplicate_leads', 'merge_leads',
  'bulk_archive_leads', 'get_user_statistics'
)
ORDER BY routine_name;
```

**Resultado esperado:** 5+ functions

### 5. Verificar Views

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name IN ('deals_pipeline_view', 'lead_conversion_funnel', 'activities_summary');
```

**Resultado esperado:** 3 views

---

## 🧪 TESTES RÁPIDOS

### Teste 1: Criar Notificação

```sql
SELECT create_notification(
  auth.uid(),
  'system',
  'Teste de Notificação',
  'Sistema de notificações funcionando!',
  NULL,
  NULL,
  NULL,
  NULL
);
```

### Teste 2: Estatísticas do Usuário

```sql
SELECT get_user_statistics();
```

### Teste 3: Buscar Duplicatas

```sql
SELECT * FROM find_duplicate_leads('teste@exemplo.com');
```

---

## 📊 RESULTADO FINAL

### ✅ Schema Completo:

- **Tabelas Core:** 10+ (profiles, leads, companies, deals, activities, etc)
- **Tabelas Novas:** 9 (notifications, tasks, webhooks, etc)
- **Total Tabelas:** 19+
- **Views:** 3 (pipeline, funnel, summary)
- **Functions:** 10+
- **Triggers:** 15+
- **Indexes:** 35+
- **RLS Policies:** 50+

### 🎯 Recursos Production-Ready:

✅ **Notificações em Tempo Real**  
✅ **Sistema de Tarefas Completo**  
✅ **Webhooks & Integrações**  
✅ **Email Templates**  
✅ **API Keys & Rate Limiting**  
✅ **Audit Log Completo**  
✅ **Filtros Salvos**  
✅ **Custom Fields Dinâmicos**  
✅ **Analytics Views**  
✅ **Busca Fuzzy (Trigram)**  
✅ **Bulk Operations**  
✅ **Merge de Duplicatas**  

---

## 🚀 PRÓXIMOS PASSOS

Após executar o schema:

1. **Testar Signup:** https://snapdoor-3rlvqvo48-uillens-projects.vercel.app/signup
2. **Configurar Email Confirmation:** docs/SUPABASE_EMAIL_SETUP.md
3. **Testar API Endpoints:** Usar Postman/Insomnia
4. **Configurar Realtime:** Testar notificações live
5. **Habilitar Storage:** Para avatares e arquivos
6. **Configurar Webhooks:** Zapier/Make integrations
7. **Setup Monitoring:** Sentry + Analytics

---

## 📚 DOCUMENTAÇÃO

Cada tabela tem comentários explicativos:

```sql
COMMENT ON TABLE public.notifications IS 'Notificações em tempo real para usuários';
COMMENT ON TABLE public.tasks IS 'Tarefas específicas com checklist e atribuição';
-- etc...
```

Use `\d+ table_name` no psql para ver detalhes completos.

---

## 🔧 TROUBLESHOOTING

### Erro: "relation already exists"
**Causa:** Tabela já criada em migration anterior  
**Solução:** Script usa `CREATE TABLE IF NOT EXISTS`, pode ignorar

### Erro: "policy already exists"
**Causa:** Policy duplicada  
**Solução:** Script tenta `DROP POLICY IF EXISTS` primeiro

### Erro: "column already exists"
**Causa:** Coluna já adicionada  
**Solução:** Script usa `ADD COLUMN IF NOT EXISTS`, pode ignorar

### Lentidão na execução
**Causa:** Muitos indexes sendo criados  
**Solução:** Normal, aguarde conclusão (até 60s)

---

## ✅ CHECKLIST FINAL

- [ ] Schema executado com sucesso
- [ ] Todas as 9 novas tabelas criadas
- [ ] Indexes criados (30+)
- [ ] RLS policies aplicadas
- [ ] Functions disponíveis
- [ ] Views criadas
- [ ] Triggers ativos
- [ ] Testes básicos passando
- [ ] Signup funcionando
- [ ] Notificações testadas

---

**🎉 RESULTADO:** Database 100% Production-Ready com +1000 linhas de schema profissional!

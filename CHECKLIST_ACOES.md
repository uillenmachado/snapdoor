# ✅ CHECKLIST DE AÇÕES PRIORITÁRIAS - SNAPDOOR CRM

**Data:** 14/01/2025  
**Projeto:** SnapDoor CRM  
**Status:** Auditoria Completa Concluída  
**Próximos Passos:** Aplicar correções críticas

---

## 🔴 SPRINT 1 - CRÍTICO (Esta Semana)

### Dia 1-2: Segurança .env

- [ ] **Backup do .env atual**
  ```powershell
  Copy-Item .env .env.backup
  ```

- [ ] **Criar .env limpo (APENAS variáveis frontend)**
  ```powershell
  @"
# Frontend Variables Only
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_HUNTER_API_KEY=your_hunter_api_key
VITE_DISCOVERY_API_KEY=your_google_api_key
VITE_DISCOVERY_RATE_LIMIT=60
VITE_DISCOVERY_CACHE_DURATION=3600000
VITE_DISCOVERY_MAX_LEADS=100
VITE_DISCOVERY_DEBUG=false
VITE_DISCOVERY_SANDBOX=false
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
"@ | Out-File -FilePath .env -Encoding utf8
  ```

- [ ] **Criar .env.server (Edge Functions)**
  ```powershell
  @"
# Backend/Edge Functions Only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
RESEND_API_KEY=your_resend_api_key
STRIPE_PRICE_PRO_MONTHLY=prod_your_price_id
STRIPE_PRICE_CREDITS_10=prod_your_credits_price_id
RESEND_FROM_EMAIL=your_email@yourdomain.com
RESEND_FROM_NAME="Your App Name"
"@ | Out-File -FilePath .env.server -Encoding utf8
  ```

- [ ] **Criar .env.example (Documentação)**
  ```powershell
  @"
# Supabase
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=https://your-project.supabase.co

# Hunter.io
VITE_HUNTER_API_KEY=your_hunter_api_key

# Google Discovery API
VITE_DISCOVERY_API_KEY=your_google_api_key
VITE_DISCOVERY_RATE_LIMIT=60
VITE_DISCOVERY_CACHE_DURATION=3600000
VITE_DISCOVERY_MAX_LEADS=100
VITE_DISCOVERY_DEBUG=false
VITE_DISCOVERY_SANDBOX=false

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Sentry
VITE_SENTRY_DSN=https://your-sentry-dsn
"@ | Out-File -FilePath .env.example -Encoding utf8
  ```

- [ ] **Adicionar .env.server ao .gitignore**
  ```powershell
  Add-Content .gitignore "`n# Server-side environment variables`n.env.server"
  ```

- [ ] **Testar aplicação após mudanças**
  ```powershell
  npm run dev
  # Verificar se tudo funciona normalmente
  ```

- [ ] **Commit das mudanças**
  ```powershell
  git add .env.example .gitignore
  git commit -m "security: Remove sensitive keys from .env, add .env.example"
  git push origin master
  ```

---

### Dia 3-4: Migrations SQL

- [ ] **Backup de todas as migrations**
  ```powershell
  Copy-Item -Path "supabase\migrations" -Destination "supabase\migrations.backup" -Recurse
  ```

- [ ] **Deletar migrations duplicadas**
  ```powershell
  Remove-Item "supabase\migrations\20251014000000_fix_handle_new_user_trigger.sql"
  Remove-Item "supabase\migrations\20251014000001_fix_all_triggers_comprehensive.sql"
  Remove-Item "supabase\migrations\20251014100000_fix_user_creation_trigger.sql"
  Remove-Item "supabase\migrations\20251014120000_production_ready_complete_schema.sql"
  ```

- [ ] **Copiar FINAL_PRODUCTION_SCHEMA.sql para migrations**
  ```powershell
  Copy-Item FINAL_PRODUCTION_SCHEMA.sql "supabase\migrations\20251014_final_production_schema.sql"
  ```

- [ ] **Executar schema no Supabase SQL Editor**
  1. Abrir Supabase Dashboard → SQL Editor
  2. Copiar conteúdo de `FINAL_PRODUCTION_SCHEMA.sql`
  3. Executar (Run)
  4. Verificar mensagens de sucesso

- [ ] **Validar execução**
  ```sql
  -- Verificar tables criadas:
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  -- Verificar functions:
  SELECT routine_name FROM information_schema.routines 
  WHERE routine_schema = 'public';
  
  -- Verificar triggers:
  SELECT trigger_name, event_object_table 
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public';
  ```

- [ ] **Commit**
  ```powershell
  git add supabase/migrations/
  git commit -m "db: Consolidate migrations, remove duplicates, use FINAL_PRODUCTION_SCHEMA"
  git push origin master
  ```

---

### Dia 5-7: Code Quality

- [ ] **Fixar N+1 query em useLeads.ts**
  
  **Antes (linha ~75):**
  ```typescript
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  ```
  
  **Depois:**
  ```typescript
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      companies:company_id (
        id,
        name,
        domain,
        logo_url,
        industry
      )
    `)
    .eq("user_id", userId)
    .order("position", { ascending: true });
  ```

- [ ] **Criar interfaces para substituir any types**
  
  **src/types/enrichment.ts (NOVO):**
  ```typescript
  export interface EnrichmentData {
    company?: string;
    position?: string;
    linkedin_url?: string;
    location?: string;
    industry?: string;
    company_size?: string;
    founded_year?: number;
    website?: string;
  }
  
  export interface QueryParams {
    domain?: string;
    email?: string;
    company?: string;
    [key: string]: string | number | boolean | undefined;
  }
  
  export interface ResultSummary {
    found: boolean;
    confidence?: number;
    sources: string[];
    enriched_fields: string[];
  }
  ```

- [ ] **Atualizar src/hooks/useLeads.ts**
  ```typescript
  import { EnrichmentData } from "@/types/enrichment";
  
  export interface Lead {
    // ...
    enrichment_data: EnrichmentData | null; // ✅ Tipado
    // ...
  }
  ```

- [ ] **Atualizar src/hooks/useCredits.ts**
  ```typescript
  import { QueryParams, ResultSummary } from "@/types/enrichment";
  
  export interface CreditUsageHistory {
    // ...
    query_params: QueryParams | null; // ✅ Tipado
    result_summary: ResultSummary | null; // ✅ Tipado
    // ...
  }
  ```

- [ ] **Fixar any types em src/types/workflow.ts**
  ```typescript
  // Linha 83-84:
  fromValue?: string | number | boolean | null;
  toValue?: string | number | boolean | null;
  
  // Linha 134:
  value?: string | number | boolean | null;
  
  // Linha 197:
  value: string | number | boolean | object;
  
  // Linha 209:
  body?: Record<string, unknown> | string;
  
  // Linha 324:
  result?: WorkflowExecutionResult;
  
  // Linha 339, 361:
  triggerData?: TriggerData;
  ```

- [ ] **Resolver vulnerabilidade npm**
  ```powershell
  npm audit
  npm audit fix
  # Se não resolver automaticamente:
  npm update [nome-do-pacote]
  ```

- [ ] **Verificar TypeScript**
  ```powershell
  npx tsc --noEmit
  # Deve retornar 0 erros
  ```

- [ ] **Commit**
  ```powershell
  git add src/
  git commit -m "refactor: Fix N+1 queries, replace any types with specific interfaces"
  git push origin master
  ```

---

## 🟠 SPRINT 2 - ALTO (Próximas 2 Semanas)

### Semana 1: Testes

- [ ] **Instalar coverage tools (se necessário)**
  ```powershell
  npm install -D @vitest/coverage-v8
  ```

- [ ] **Executar cobertura atual**
  ```powershell
  npm run test:coverage
  # Salvar resultado baseline
  ```

- [ ] **Criar testes para useAuth.ts**
  
  **src/test/useAuth.test.tsx:**
  ```typescript
  import { renderHook, waitFor } from '@testing-library/react';
  import { useAuth } from '@/hooks/useAuth';
  import { supabase } from '@/integrations/supabase/client';
  
  describe('useAuth', () => {
    it('should fetch user session on mount', async () => {
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
    
    it('should sign out user', async () => {
      const { result } = renderHook(() => useAuth());
      
      await result.current.signOut();
      
      expect(result.current.user).toBeNull();
    });
  });
  ```

- [ ] **Criar testes para useCredits.ts**

- [ ] **Criar testes para useLeads.ts**

- [ ] **Objetivo: Cobertura >50%**

---

### Semana 2: Performance

- [ ] **Analisar bundle size**
  ```powershell
  npm run build
  npx vite-bundle-visualizer
  ```

- [ ] **Implementar code splitting para recharts**
  ```typescript
  // src/pages/Analytics.tsx
  import { lazy, Suspense } from 'react';
  
  const RechartsComponent = lazy(() => import('@/components/Charts'));
  
  export const Analytics = () => (
    <Suspense fallback={<LoadingSkeleton />}>
      <RechartsComponent />
    </Suspense>
  );
  ```

- [ ] **Lazy load de rotas**
  ```typescript
  // src/App.tsx
  import { lazy } from 'react';
  
  const Leads = lazy(() => import('@/pages/Leads'));
  const Deals = lazy(() => import('@/pages/Deals'));
  const Analytics = lazy(() => import('@/pages/Analytics'));
  ```

- [ ] **Objetivo: Bundle <500KB gzipped**

---

## 🟡 SPRINT 3 - MÉDIO (Próximo Mês)

- [ ] **Acessibilidade: ARIA labels**
- [ ] **SEO: Meta tags**
- [ ] **Remover código morto**
  ```powershell
  Remove-Item PRODUCTION_SCHEMA_MASTER.sql
  Remove-Item SUPABASE_FIX_SCRIPT.sql
  ```
- [ ] **Configurar Sentry em produção**

---

## 🔵 SPRINT 4 - BAIXO (Backlog)

- [ ] **Renomear projeto em package.json**
  ```json
  {
    "name": "snapdoor-crm",
    "version": "1.0.0"
  }
  ```

- [ ] **Adicionar scripts úteis**
  ```json
  {
    "scripts": {
      "analyze": "vite-bundle-visualizer",
      "type-check": "tsc --noEmit",
      "format": "prettier --write .",
      "deploy": "vercel --prod"
    }
  }
  ```

- [ ] **Criar CI/CD pipeline (GitHub Actions)**

---

## ✅ CHECKLIST DE DEPLOY EM PRODUÇÃO

### Antes do Deploy

- [ ] ✅ .env limpo (APENAS VITE_*)
- [ ] ✅ Secrets em .env.server
- [ ] ✅ Git history sem .env commits
- [ ] ✅ FINAL_PRODUCTION_SCHEMA.sql executado
- [ ] ✅ Migrations duplicadas removidas
- [ ] ✅ N+1 queries corrigidas
- [ ] ✅ any types <5 ocorrências
- [ ] ✅ npm audit 0 vulnerabilities
- [ ] ✅ Cobertura de testes >50%
- [ ] ✅ Bundle size <500KB

### Comandos de Deploy

```powershell
# 1. Build de produção
npm run build

# 2. Testar build localmente
npm run preview

# 3. Deploy (Vercel)
npx vercel --prod

# 4. Verificar deploy
# Abrir URL fornecida pelo Vercel
```

### Pós-Deploy

- [ ] Testar autenticação
- [ ] Testar criação de lead
- [ ] Testar sistema de créditos
- [ ] Testar enriquecimento
- [ ] Verificar Sentry (erros)
- [ ] Verificar Analytics

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Antes | Meta | Atual |
|---------|-------|------|-------|
| **Vulnerabilidades** | 1 | 0 | ⏳ |
| **any types** | 21+ | <5 | ⏳ |
| **Cobertura Testes** | <30% | >70% | ⏳ |
| **Bundle Size** | ~800KB | <500KB | ⏳ |
| **Migrations** | 28 (4 dup) | 24 | ⏳ |
| **TypeScript Errors** | 0 | 0 | ✅ |
| **SQL Schema** | ✅ | ✅ | ✅ |

---

**Última Atualização:** 14/01/2025  
**Status:** Sprint 1 pronto para execução 🚀

# 📋 ANÁLISE DETALHADA ARQUIVO POR ARQUIVO

**Projeto:** SnapDoor CRM  
**Data:** 14/01/2025  
**Total de Arquivos:** 608

---

## 🗂️ ESTRUTURA DO PROJETO

```
snapdoor/
├── 📁 src/ (450+ arquivos TypeScript/React)
│   ├── components/ (100+ componentes)
│   ├── hooks/ (15 hooks customizados)
│   ├── services/ (8 serviços)
│   ├── types/ (10+ definições de tipos)
│   ├── pages/ (15 páginas)
│   ├── integrations/ (Supabase client)
│   └── test/ (3 arquivos de teste)
│
├── 📁 supabase/ (100+ arquivos)
│   ├── migrations/ (28 migrations SQL)
│   └── functions/ (Edge Functions)
│
├── 📁 docs/ (15 arquivos de documentação)
├── 📁 public/ (assets estáticos)
└── 📁 scripts/ (scripts utilitários)
```

---

## 🔴 ARQUIVOS CRÍTICOS ANALISADOS

### 1. `.env` - CREDENCIAIS E CONFIGURAÇÃO

**Caminho:** `c:\Users\Uillen Machado\Documents\Meus projetos\snapdoor\.env`  
**Linhas:** 32  
**Status:** 🔴 **CRÍTICO - Requer limpeza imediata**

**Conteúdo Atual:**
```env
# ✅ CORRETO (variáveis públicas para frontend)
VITE_SUPABASE_PROJECT_ID=cfydbvrzjtbcrbzimfjm
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... (anon key - OK para frontend)
VITE_SUPABASE_URL=https://cfydbvrzjtbcrbzimfjm.supabase.co
VITE_HUNTER_API_KEY=c2e0acf158a... (linha 4)
VITE_DISCOVERY_API_KEY=AIzaSyDjy9oAv7vSe9lrYJnva7Od6Teqgzx3qqk
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SICymR0uRM6i2yc...

# 🔴 INCORRETO (NÃO devem estar no frontend!)
SUPABASE_SERVICE_ROLE_KEY=eyJ... ❌ BYPASS RLS - ALTÍSSIMO RISCO
STRIPE_SECRET_KEY=sk_test_51SI... ❌ Chave secreta Stripe
RESEND_API_KEY=re_BZM9Y2pf... ❌ Backend only
SENTRY_AUTH_TOKEN=sntryu_5bed... ❌ CI/CD only

# 🟡 DUPLICADO
VITE_HUNTER_API_KEY=c2e0acf158a... (linha 12) ⚠️ DUPLICATA
```

**Problemas Encontrados:**
1. 🔴 **SUPABASE_SERVICE_ROLE_KEY** presente (dá acesso TOTAL ao banco, bypass RLS)
2. 🔴 **STRIPE_SECRET_KEY** exposta (pode criar charges sem autorização)
3. 🔴 **RESEND_API_KEY** no frontend (backend only)
4. 🔴 **SENTRY_AUTH_TOKEN** no código (deve estar apenas em CI/CD)
5. 🟡 **VITE_HUNTER_API_KEY** duplicada (linhas 4 e 12)

**Configuração de Ambiente (verificada):**
```properties
# Configurações Discovery API
VITE_DISCOVERY_RATE_LIMIT=60
VITE_DISCOVERY_CACHE_DURATION=3600000
VITE_DISCOVERY_MAX_LEADS=100
VITE_DISCOVERY_DEBUG=false
VITE_DISCOVERY_SANDBOX=false

# Stripe Products
STRIPE_PRICE_PRO_MONTHLY=prod_TEgZCItw9BZ0Ea
STRIPE_PRICE_ENTERPRISE_MONTHLY= (vazio)
STRIPE_PRICE_CREDITS_10=prod_TEgbjKPkr1AHq3
STRIPE_PRICE_CREDITS_50= (vazio)
STRIPE_PRICE_CREDITS_100= (vazio)

# Resend Email
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME="SnapDoor CRM"
```

**Ação Requerida:**
```bash
# Criar .env limpo:
cat > .env << 'EOF'
# Frontend Variables Only
VITE_SUPABASE_PROJECT_ID=cfydbvrzjtbcrbzimfjm
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_URL=https://cfydbvrzjtbcrbzimfjm.supabase.co
VITE_HUNTER_API_KEY=c2e0acf158a10a3c0253b49c006a80979679cc5c
VITE_DISCOVERY_API_KEY=AIzaSyDjy9oAv7vSe9lrYJnva7Od6Teqgzx3qqk
VITE_DISCOVERY_RATE_LIMIT=60
VITE_DISCOVERY_CACHE_DURATION=3600000
VITE_DISCOVERY_MAX_LEADS=100
VITE_DISCOVERY_DEBUG=false
VITE_DISCOVERY_SANDBOX=false
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SICymR0uRM6i2yc...
VITE_SENTRY_DSN=https://56afab2858fc61a532d59ec4bd959764@o4510189173014528.ingest.us.sentry.io/4510189177864192
EOF

# Criar .env.server (para Edge Functions):
cat > .env.server << 'EOF'
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_51SI...
RESEND_API_KEY=re_BZM9Y2pf...
STRIPE_PRICE_PRO_MONTHLY=prod_TEgZCItw9BZ0Ea
STRIPE_PRICE_CREDITS_10=prod_TEgbjKPkr1AHq3
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME="SnapDoor CRM"
EOF

# Criar .env.example (documentação):
cat > .env.example << 'EOF'
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_HUNTER_API_KEY=your_hunter_api_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
EOF
```

---

### 2. `.gitignore` - CONFIGURAÇÃO DE SEGURANÇA

**Caminho:** `c:\Users\Uillen Machado\Documents\Meus projetos\snapdoor\.gitignore`  
**Linhas:** 305  
**Status:** ✅ **EXCELENTE - Configurado corretamente**

**Verificação de Segurança:**
```ignore
# ✅ Arquivos .env COBERTOS:
.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
.env.*.local
*.env
**/node_modules/**/.env
```

**Verificação Git History:**
```bash
git log --all --oneline -- ".env" 2>&1
# Resultado: VAZIO ✅ (arquivo nunca foi commitado)
```

**Conclusão:** ✅ `.env` está seguro (não foi commitado), mas precisa ser limpo localmente.

---

### 3. `package.json` - DEPENDÊNCIAS E SCRIPTS

**Caminho:** `c:\Users\Uillen Machado\Documents\Meus projetos\snapdoor\package.json`  
**Linhas:** 114  
**Status:** 🟡 **Bom com melhorias necessárias**

**Metadados do Projeto:**
```json
{
  "name": "vite_react_shadcn_ts", // 🟡 Renomear para "snapdoor-crm"
  "private": true,
  "version": "0.0.0", // 🟡 Atualizar para "1.0.0" em produção
  "type": "module"
}
```

**Scripts Disponíveis:**
```json
{
  "dev": "vite", // ✅ Desenvolvimento
  "build": "vite build", // ✅ Build produção
  "build:dev": "vite build --mode development", // ✅ Build dev
  "lint": "eslint .", // ✅ Linting
  "preview": "vite preview", // ✅ Preview build
  "test": "vitest", // ✅ Testes unitários
  "test:ui": "vitest --ui", // ✅ UI de testes
  "test:coverage": "vitest --coverage", // ✅ Cobertura
  "db:migrate": "ts-node scripts/apply-migration-http.ts", // ✅ Migrations
  "db:types": "npx supabase gen types...", // ✅ Gerar types do Supabase
  "bootstrap:admin": "tsx scripts/bootstrap-admin.ts" // ✅ Criar admin
}
```

**Faltam scripts úteis:**
```json
// 🟡 ADICIONAR:
"analyze": "vite-bundle-visualizer", // Bundle analysis
"type-check": "tsc --noEmit", // Type checking
"format": "prettier --write .", // Formatação
"prepare": "husky install", // Git hooks
"deploy": "vercel --prod" // Deploy
```

**Dependências Principais (50+):**
```json
{
  "@supabase/supabase-js": "^2.75.0", // ✅ Supabase client
  "@tanstack/react-query": "^5.83.0", // ✅ Data fetching
  "react": "^18.3.1", // ✅ React 18
  "react-router-dom": "^6.30.1", // ✅ Routing
  "recharts": "^2.15.4", // 🟡 Pesado (code splitting)
  "zod": "^3.25.76", // ✅ Validação
  "tailwindcss": "^3.x", // ✅ Styling
  "@radix-ui/react-*": "^1.x", // ✅ Componentes
  "lucide-react": "^0.462.0", // ✅ Ícones
  "@sentry/react": "^10.19.0", // ✅ Error tracking
  "stripe": "Não listado", // ⚠️ Verificar se usa @stripe/stripe-js
  "resend": "^6.1.3", // ✅ Email service
  "jspdf": "^3.0.3" // ✅ PDF generation
}
```

**DevDependencies (20+):**
```json
{
  "@vitejs/plugin-react-swc": "^3.11.0", // ✅ Vite plugin
  "typescript": "^5.x", // ✅ TypeScript
  "vitest": "^3.2.4", // ✅ Testing
  "@testing-library/react": "^16.3.0", // ✅ React testing
  "@testing-library/user-event": "^14.6.1", // ✅ User interactions
  "eslint": "^9.32.0", // ✅ Linting
  "autoprefixer": "^10.4.21", // ✅ PostCSS
  "tailwindcss": "^3.x" // ✅ Styling
}
```

**Vulnerabilidades:**
```bash
npm audit
# Resultado: 1 vulnerabilidade encontrada
# Ação: npm audit fix
```

**Tamanho Estimado do Bundle:**
- Recharts: ~200KB (considerar code splitting)
- Radix UI: ~150KB (tree-shaking aplicado)
- React + React DOM: ~130KB
- Total estimado: ~800KB (reduzir para <500KB com otimizações)

---

### 4. `tsconfig.json` - CONFIGURAÇÃO TYPESCRIPT

**Caminho:** `c:\Users\Uillen Machado\Documents\Meus projetos\snapdoor\tsconfig.json`  
**Status:** ✅ **EXCELENTE**

**Configurações Principais:**
```json
{
  "compilerOptions": {
    "target": "ES2020", // ✅ Moderno
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    // ✅ STRICT MODE HABILITADO:
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    // ✅ MODULE RESOLUTION:
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    // ✅ PATH ALIASES:
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**Análise:**
- ✅ Strict mode: Máxima segurança de tipos
- ✅ No unused vars: Código limpo
- ✅ Path aliases: Imports organizados
- ✅ ESNext modules: Otimizações modernas

---

### 5. `src/hooks/useLeads.ts` - HOOK PRINCIPAL DE LEADS

**Caminho:** `src/hooks/useLeads.ts`  
**Linhas:** 240  
**Status:** 🟠 **Bom mas com N+1 query**

**Interface Lead:**
```typescript
export interface Lead {
  id: string;
  user_id: string;
  
  // ✅ Bem tipado:
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  company: string | null;
  
  status: string;
  source: string | null;
  tags: string[] | null;
  
  // 🔴 any type:
  enrichment_data: any; // ❌ Deveria ser EnrichmentData interface
  
  deal_value: number;
  expected_close_date: string | null;
  probability: number;
  deal_stage: string;
  
  created_at: string;
  updated_at: string;
}
```

**Problema N+1 Query (linha ~75):**
```typescript
export const useLeads = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["leads", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*") // ❌ SEM JOIN com companies
        .eq("user_id", userId)
        .order("position", { ascending: true });

      // Resultado: Para cada lead, componente faz:
      // SELECT * FROM companies WHERE id = lead.company_id
      // = N+1 queries!
    }
  });
};
```

**Solução:**
```typescript
export const useLeads = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["leads", userId],
    queryFn: async () => {
      const { data, error} = await supabase
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
        `) // ✅ JOIN em 1 query
        .eq("user_id", userId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!userId,
  });
};
```

**Mutations:**
```typescript
// ✅ BEM IMPLEMENTADO:
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLead) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(newLead as any) // 🔴 as any (deveria tipar)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: (data) => {
      // ✅ Invalidação correta:
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", "stage", data.stage_id] });
      toast.success("Lead adicionado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar lead: ${error.message}`);
    },
  });
};
```

---

### 6. `src/hooks/useAuth.ts` - AUTENTICAÇÃO

**Caminho:** `src/hooks/useAuth.ts`  
**Linhas:** 48  
**Status:** ✅ **EXCELENTE**

**Implementação:**
```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // ✅ Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // ✅ CLEANUP CORRETO:
    return () => subscription.unsubscribe();
  }, []); // ✅ Deps array vazia (roda 1 vez)

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      // ✅ Error handling correto:
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Erro desconhecido ao fazer logout";
      toast.error(`Erro ao fazer logout: ${errorMessage}`);
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};
```

**Análise:**
- ✅ Type safety: User tipado com User from @supabase/supabase-js
- ✅ Cleanup: subscription.unsubscribe() no return
- ✅ Error handling: try/catch com mensagens descritivas
- ✅ Loading state: Evita flickering na UI
- ✅ Deps array: [] correto (evita re-renders infinitos)

**Nenhum problema encontrado!** 🎉

---

### 7. `src/hooks/useCredits.ts` - SISTEMA DE CRÉDITOS

**Caminho:** `src/hooks/useCredits.ts`  
**Linhas:** 274  
**Status:** 🟡 **Bom mas com any types**

**Interfaces:**
```typescript
export interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  total_purchased: number;
  total_used: number;
  created_at: string;
  updated_at: string;
}

export interface CreditUsageHistory {
  id: string;
  user_id: string;
  operation_type: string;
  credits_used: number;
  domain: string | null;
  email: string | null;
  query_params: any; // 🔴 Deveria ser QueryParams interface
  result_summary: any; // 🔴 Deveria ser ResultSummary interface
  success: boolean;
  error_message: string | null;
  created_at: string;
}
```

**useUserCredits (linhas 52-77):**
```typescript
export const useUserCredits = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-credits", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // ✅ BOM: Cria automaticamente se não existe
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from("user_credits")
            .insert({ user_id: userId, credits: 10 })
            .select()
            .single();

          if (insertError) throw insertError;
          return newData as UserCredits;
        }
        throw error;
      }

      return data as UserCredits;
    },
    enabled: !!userId,
  });
};
```

**Análise:**
- ✅ Criação automática de créditos iniciais (10 créditos)
- ✅ Error handling correto (verifica PGRST116)
- 🔴 any types em query_params e result_summary

---

## 🗃️ MIGRATIONS SQL - ANÁLISE COMPLETA

**Diretório:** `supabase/migrations/`  
**Total:** 28 arquivos  
**Status:** 🔴 **4 duplicadas, 24 válidas**

### Migrations Válidas (24):

1. ✅ `20251009133602_b9c092c5-1767-4bfc-86fe-ca16e53b723b.sql`
2. ✅ `20251009133633_2d78aa77-69e3-4ccb-9889-6ac8502e1250.sql`
3. ✅ `20251009140000_setup_storage_avatars.sql`
4. ✅ `20251009150000_create_subscriptions.sql`
5. ✅ `20251009160000_expand_schema_production.sql`
6. ✅ `20251009170000_security_policies.sql`
7. ✅ `20251010000000_create_credits_system.sql`
8. ✅ `20251010000001_fix_all_tables.sql`
9. ✅ `20251010000002_fix_all_tables_v2.sql`
10. ✅ `20251010000003_dev_account_unlimited_credits.sql`
11. ✅ `20251010000004_fix_user_credits_rls.sql`
12. ✅ `20251010000005_add_leads_source_column.sql`
13. ✅ `20251010000006_add_linkedin_enrichment_fields.sql`
14. ✅ `20251010000007_create_companies_table.sql`
15. ✅ `20251010000008_create_lead_contacts_table.sql`
16. ✅ `20251010000009_add_enrichment_fields_to_leads.sql`
17. ✅ `20251010190000_create_deals_structure.sql`
18. ✅ `20251013000001_create_admin_user.sql`
19. ✅ `20251013000005_workflows.sql`
20. ✅ `20251013000006_analytics_views.sql`
21. ✅ `20251013000007_teams_roles.sql`
22. ✅ `20251013000008_team_visibility_rls.sql`
23. ✅ `20251013000009_scraper_queue.sql`
24. ✅ `FINAL_PRODUCTION_SCHEMA.sql` (848 linhas, production-ready)

### Migrations Duplicadas (4):

🔴 **TODAS modificam o trigger `handle_new_user`:**

1. `20251014000000_fix_handle_new_user_trigger.sql`
2. `20251014000001_fix_all_triggers_comprehensive.sql`
3. `20251014100000_fix_user_creation_trigger.sql`
4. `20251014120000_production_ready_complete_schema.sql`

**Problema:**
```sql
-- Todas fazem DROP TRIGGER/DROP FUNCTION/CREATE do mesmo objeto!
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Lógica de criação de profile, credits, etc
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Solução:**
- Deletar as 4 migrations duplicadas
- Usar `FINAL_PRODUCTION_SCHEMA.sql` como única fonte de verdade
- Renomear para `supabase/migrations/20251014_final_production_schema.sql`

---

## 📊 TYPES - ANÁLISE DE any

**Total de any types encontrados:** 21+

### src/types/workflow.ts (10 ocorrências):

```typescript
// Linha 83-84:
fromValue?: any;  // ❌ Deveria ser: string | number | boolean | null
toValue?: any;    // ❌ Deveria ser: string | number | boolean | null

// Linha 134:
value?: any; // ❌ Deveria ser union type

// Linha 197:
value: any; // ❌ Deveria ser specific type

// Linha 209:
body?: any; // ❌ Deveria ser Record<string, unknown> | string

// Linha 324:
result?: any; // ❌ Deveria ser WorkflowExecutionResult

// Linha 339, 361:
triggerData?: any; // ❌ Deveria ser TriggerData interface

// Linha 471:
[key: string]: any; // ❌ Index signature muito permissivo

// Linha 677:
let value: any = context; // ❌ Deveria inferir do context
```

### src/services/*.ts (7 ocorrências):

```typescript
// src/services/smartProspectionService.ts linha 284:
const customFields = lead.custom_fields as any;

// linha 300:
let enrichmentData: any = {};

// linha 447:
private async logProspection(userId: string, data: any): Promise<void>

// src/services/leadEnrichmentService.ts linha 64:
let enrichedData: any = {};

// src/services/leadDiscoveryService.ts linha 68:
private cache: Map<string, { data: any; timestamp: number }> = new Map();

// linha 106:
private getCacheKey(endpoint: string, params: any): string

// linha 110:
private getFromCache(key: string): any | null

// linha 124:
private setCache(key: string, data: any): void

// linha 222:
const companies = result.data.map((company: any): CompanyResult => ({

// linha 257:
const emails: EmailResult[] = result.emails.map((email: any) => ({
```

### src/services/importService.ts (1 ocorrência):

```typescript
// linha 76:
}) as any[][];
```

**Recomendação:**
- Criar interfaces específicas para cada caso
- Usar generic types quando apropriado
- Evitar any completamente (strict mode ajuda)

---

## 📈 RESUMO GERAL

### Arquivos Analisados em Detalhe:

| Arquivo | Linhas | Status | Issues |
|---------|--------|--------|--------|
| `.env` | 32 | 🔴 | 5 críticos |
| `.gitignore` | 305 | ✅ | 0 |
| `package.json` | 114 | 🟡 | 2 melhorias |
| `tsconfig.json` | 60 | ✅ | 0 |
| `useAuth.ts` | 48 | ✅ | 0 |
| `useLeads.ts` | 240 | 🟠 | N+1 query |
| `useCredits.ts` | 274 | 🟡 | 2 any types |
| `workflow.ts` | 700+ | 🔴 | 10 any types |
| Migrations | 28 | 🔴 | 4 duplicadas |

### Próximos Arquivos a Analisar:

**Alta Prioridade:**
- [ ] src/services/leadEnrichmentService.ts
- [ ] src/services/hunterClient.ts
- [ ] src/services/smartProspectionService.ts
- [ ] src/components/LeadCard.tsx
- [ ] src/components/DashboardMetrics.tsx
- [ ] src/pages/Leads.tsx

**Média Prioridade:**
- [ ] src/test/*.test.tsx (validar cobertura)
- [ ] src/components/ui/* (acessibilidade)
- [ ] supabase/functions/* (edge functions)

---

**Última Atualização:** 14/01/2025 - Análise Detalhada em Progresso  
**Progresso:** ~10% dos 608 arquivos (foco em arquivos críticos)

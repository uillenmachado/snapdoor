# 🔧 API Reference - SnapDoor CRM

> Documentação técnica completa de APIs, hooks, services e tipos TypeScript

## 📑 Índice

1. [Custom Hooks](#custom-hooks)
2. [Services](#services)
3. [Supabase Edge Functions](#supabase-edge-functions)
4. [TypeScript Types](#typescript-types)
5. [Utilities](#utilities)
6. [Componentes Reutilizáveis](#componentes-reutilizáveis)

---

## 🪝 Custom Hooks

### useAuth

Gerenciamento de autenticação e sessão do usuário.

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, session, signIn, signUp, signOut, loading } = useAuth();
  
  // user: User | null
  // session: Session | null
  // loading: boolean
}
```

#### Métodos

**`signIn(email: string, password: string): Promise<void>`**
- Autentica usuário com email/senha
- Retorna erro se credenciais inválidas

**`signUp(email: string, password: string, metadata?: object): Promise<void>`**
- Cria nova conta de usuário
- Envia email de confirmação

**`signOut(): Promise<void>`**
- Encerra sessão do usuário
- Limpa tokens e cache

---

### useLeads

Gerenciamento de leads (buscar, criar, atualizar, deletar).

```typescript
import { useLeads } from '@/hooks/useLeads';

function LeadsList() {
  const { 
    leads, 
    isLoading, 
    createLead, 
    updateLead, 
    deleteLead,
    refetch 
  } = useLeads();
}
```

#### Retorno

| Propriedade | Tipo | Descrição |
|------------|------|-----------|
| `leads` | `Lead[]` | Lista de leads |
| `isLoading` | `boolean` | Estado de carregamento |
| `error` | `Error \| null` | Erro se houver |
| `createLead` | `(data: CreateLeadInput) => Promise<Lead>` | Criar lead |
| `updateLead` | `(id: string, data: UpdateLeadInput) => Promise<Lead>` | Atualizar lead |
| `deleteLead` | `(id: string) => Promise<void>` | Deletar lead |
| `refetch` | `() => void` | Recarregar lista |

#### Tipos

```typescript
interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source?: 'linkedin' | 'website' | 'referral' | 'other';
  temperature?: 'hot' | 'warm' | 'cold';
}

interface UpdateLeadInput extends Partial<CreateLeadInput> {
  status?: 'new' | 'qualified' | 'negotiation' | 'won' | 'lost';
  linkedin_url?: string;
  notes?: string;
}
```

---

### useDeals

Gerenciamento de negócios no pipeline.

```typescript
import { useDeals } from '@/hooks/useDeals';

function DealsPipeline() {
  const { 
    deals, 
    isLoading, 
    createDeal, 
    updateDeal, 
    moveDeal,
    closeDeal 
  } = useDeals();
}
```

#### Métodos

**`createDeal(data: CreateDealInput): Promise<Deal>`**

```typescript
interface CreateDealInput {
  title: string;
  value: number;
  lead_id: string;
  stage: 'new' | 'qualification' | 'proposal' | 'negotiation' | 'closed';
  probability?: number; // 0-100
  expected_close_date?: string; // ISO 8601
}
```

**`moveDeal(id: string, newStage: DealStage): Promise<Deal>`**
- Move negócio entre estágios do pipeline
- Atualiza automaticamente `updated_at`

**`closeDeal(id: string, outcome: 'won' | 'lost', reason?: string): Promise<Deal>`**
- Fecha negócio como ganho ou perdido
- Registra motivo (obrigatório para perdidos)

---

### useActivities

Gerenciamento de atividades (emails, ligações, reuniões, tarefas).

```typescript
import { useActivities } from '@/hooks/useActivities';

function ActivitiesList() {
  const { 
    activities, 
    createActivity, 
    updateActivity, 
    completeActivity 
  } = useActivities({ leadId: 'lead-123' });
}
```

#### Parâmetros

```typescript
interface UseActivitiesParams {
  leadId?: string;       // Filtrar por lead
  dealId?: string;       // Filtrar por negócio
  type?: ActivityType;   // Filtrar por tipo
  status?: 'pending' | 'completed';
}
```

#### Métodos

**`createActivity(data: CreateActivityInput): Promise<Activity>`**

```typescript
interface CreateActivityInput {
  type: 'email' | 'call' | 'meeting' | 'task' | 'note';
  title: string;
  description?: string;
  due_date?: string;
  lead_id?: string;
  deal_id?: string;
  participants?: string[]; // User IDs
  reminder?: boolean;
}
```

**`completeActivity(id: string, result?: string): Promise<Activity>`**
- Marca atividade como concluída
- Registra resultado (ex: "Reunião realizada - enviada proposta")

---

### useEnrichLead

Enriquecimento automático de leads usando Hunter.io e LinkedIn Scraper.

```typescript
import { useEnrichLead } from '@/hooks/useEnrichLead';

function LeadEnrichButton({ leadId }: { leadId: string }) {
  const { enrichLead, isEnriching, creditsUsed } = useEnrichLead();

  const handleEnrich = async () => {
    const enrichedData = await enrichLead(leadId);
    console.log('Dados enriquecidos:', enrichedData);
  };
}
```

#### Retorno

| Propriedade | Tipo | Descrição |
|------------|------|-----------|
| `enrichLead` | `(leadId: string) => Promise<EnrichedData>` | Enriquecer lead |
| `isEnriching` | `boolean` | Estado de enriquecimento |
| `creditsUsed` | `number` | Créditos consumidos |
| `error` | `Error \| null` | Erro se houver |

#### Tipos

```typescript
interface EnrichedData {
  email_verified: boolean;
  email_score: number; // 0-100
  position: string;
  company: string;
  linkedin_url: string;
  phone_numbers: string[];
  social_profiles: {
    twitter?: string;
    github?: string;
  };
  company_info?: {
    domain: string;
    industry: string;
    size: string;
  };
}
```

---

### useCredits

Gerenciamento de créditos de enriquecimento.

```typescript
import { useCredits } from '@/hooks/useCredits';

function CreditsBalance() {
  const { balance, usage, purchaseCredits, isLoading } = useCredits();

  return (
    <div>
      <p>Saldo: {balance} créditos</p>
      <p>Usados este mês: {usage.monthly}</p>
    </div>
  );
}
```

#### Métodos

**`purchaseCredits(amount: number): Promise<void>`**
- Inicia checkout Stripe para compra de créditos
- Valores: 10, 50, 100, 500 créditos

**`checkBalance(): number`**
- Retorna saldo atual de créditos

**`getUsageHistory(): CreditUsage[]`**
- Histórico de consumo de créditos

---

### useAutomations

Gerenciamento de automações.

```typescript
import { useAutomations } from '@/hooks/useAutomations';

function AutomationsList() {
  const { 
    automations, 
    createAutomation, 
    toggleAutomation,
    deleteAutomation 
  } = useAutomations();
}
```

#### Tipos

```typescript
interface Automation {
  id: string;
  name: string;
  trigger: 'lead_created' | 'lead_updated' | 'deal_moved' | 'scheduled';
  conditions: Condition[];
  actions: Action[];
  is_active: boolean;
  created_at: string;
}

interface Condition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | 'contains';
  value: any;
}

interface Action {
  type: 'send_email' | 'create_task' | 'update_field' | 'notify';
  params: Record<string, any>;
}
```

---

### useDebounce

Debouncing de valores (performance).

```typescript
import { useDebounce } from '@/hooks/useDebounce';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // Faz busca apenas após 500ms sem digitação
      searchLeads(debouncedSearch);
    }
  }, [debouncedSearch]);
}
```

#### Parâmetros

- `value: T` - Valor a ser debounced
- `delay: number` - Delay em milissegundos (padrão: 500ms)

#### Retorno

- Valor debounced do tipo `T`

---

### useVirtualList

Renderização otimizada de listas grandes (virtual scrolling).

```typescript
import { useVirtualList } from '@/hooks/useVirtualList';

function LeadsList({ leads }: { leads: Lead[] }) {
  const { visibleItems, containerProps, scrollToIndex } = useVirtualList({
    itemCount: leads.length,
    itemHeight: 80,
    containerHeight: 600,
    overscan: 5
  });

  return (
    <div {...containerProps}>
      {visibleItems.map(({ index, offsetTop }) => (
        <div key={index} style={{ position: 'absolute', top: offsetTop }}>
          <LeadCard lead={leads[index]} />
        </div>
      ))}
    </div>
  );
}
```

#### Parâmetros

```typescript
interface UseVirtualListParams {
  itemCount: number;      // Total de itens
  itemHeight: number;     // Altura de cada item (px)
  containerHeight: number; // Altura do container (px)
  overscan?: number;      // Items extras renderizados (padrão: 3)
}
```

---

## 🔌 Services

### leadEnrichmentService

Serviço de enriquecimento de leads.

```typescript
import { leadEnrichmentService } from '@/services/leadEnrichmentService';

// Enriquecer lead
const enrichedData = await leadEnrichmentService.enrichLead({
  email: 'john@example.com',
  name: 'John Doe'
});

// Verificar email
const isValid = await leadEnrichmentService.verifyEmail('john@example.com');

// Buscar contatos de empresa
const contacts = await leadEnrichmentService.findCompanyContacts('example.com');
```

#### Métodos

**`enrichLead(lead: LeadInput): Promise<EnrichedData>`**
- Enriquece lead usando Hunter.io + LinkedIn Scraper
- Consome 1 crédito

**`verifyEmail(email: string): Promise<EmailVerification>`**
- Verifica se email existe e é válido
- Retorna score de deliverability (0-100)

**`findCompanyContacts(domain: string): Promise<Contact[]>`**
- Busca contatos de uma empresa pelo domínio
- Retorna lista de emails verificados

---

### hunterClient

Cliente para API do Hunter.io.

```typescript
import { hunterClient } from '@/services/hunterClient';

// Email Finder
const email = await hunterClient.emailFinder({
  domain: 'example.com',
  first_name: 'John',
  last_name: 'Doe'
});

// Email Verifier
const verification = await hunterClient.emailVerifier('john@example.com');

// Domain Search
const domainData = await hunterClient.domainSearch('example.com');
```

---

### linkedinScraperService

Scraper de perfis do LinkedIn.

```typescript
import { linkedinScraperService } from '@/services/linkedinScraperService';

const profile = await linkedinScraperService.scrapeProfile(
  'https://linkedin.com/in/johndoe'
);

console.log(profile.position);  // "Software Engineer"
console.log(profile.company);   // "Tech Corp"
console.log(profile.skills);    // ["JavaScript", "React", "Node.js"]
```

#### Retorno

```typescript
interface LinkedInProfile {
  name: string;
  headline: string;
  position: string;
  company: string;
  location: string;
  about: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  profile_url: string;
  avatar_url: string;
}
```

---

### smartProspectionService

Prospecção inteligente com IA.

```typescript
import { smartProspectionService } from '@/services/smartProspectionService';

// Gerar leads similares
const similarLeads = await smartProspectionService.findSimilarLeads({
  targetProfile: 'CTO de startups fintech em SP',
  industry: 'fintech',
  location: 'São Paulo',
  companySize: '11-50'
});

// Sugerir estratégia de abordagem
const strategy = await smartProspectionService.suggestOutreachStrategy({
  leadId: 'lead-123',
  previousInteractions: []
});
```

---

## ⚡ Supabase Edge Functions

### enrich-lead

Enriquece lead usando APIs externas.

**Endpoint**: `POST /functions/v1/enrich-lead`

**Headers**:
```
Authorization: Bearer <SUPABASE_ANON_KEY>
Content-Type: application/json
```

**Body**:
```json
{
  "lead_id": "uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "company": "Tech Corp"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "email_verified": true,
    "email_score": 95,
    "position": "CTO",
    "company": "Tech Corp",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "phone_numbers": ["+55 11 98765-4321"],
    "social_profiles": {
      "twitter": "johndoe",
      "github": "johndoe"
    }
  },
  "credits_used": 1
}
```

---

### process-automation

Executa automação baseada em gatilho.

**Endpoint**: `POST /functions/v1/process-automation`

**Body**:
```json
{
  "automation_id": "uuid",
  "trigger_data": {
    "lead_id": "uuid",
    "field_changed": "status",
    "new_value": "qualified"
  }
}
```

**Response**:
```json
{
  "success": true,
  "actions_executed": [
    {
      "type": "send_email",
      "status": "sent",
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "type": "create_task",
      "status": "created",
      "task_id": "uuid"
    }
  ]
}
```

---

### generate-report

Gera relatório de analytics.

**Endpoint**: `POST /functions/v1/generate-report`

**Body**:
```json
{
  "report_type": "monthly_performance",
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "user_id": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "report": {
    "leads_generated": 150,
    "conversion_rate": 23.5,
    "avg_ticket": 5000,
    "sales_cycle_days": 45,
    "deals_won": 12,
    "deals_lost": 8,
    "revenue": 60000
  },
  "charts": {
    "funnel": "base64_image_data",
    "trend": "base64_image_data"
  }
}
```

---

## 📐 TypeScript Types

### Lead

```typescript
interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  linkedin_url?: string;
  source: 'linkedin' | 'website' | 'referral' | 'import' | 'other';
  status: 'new' | 'qualified' | 'negotiation' | 'won' | 'lost' | 'archived';
  temperature: 'hot' | 'warm' | 'cold';
  score?: number; // 0-100
  notes?: string;
  custom_fields?: Record<string, any>;
  enriched_at?: string;
  created_at: string;
  updated_at: string;
}
```

### Deal

```typescript
interface Deal {
  id: string;
  user_id: string;
  lead_id: string;
  title: string;
  value: number;
  currency: string; // 'BRL', 'USD', etc.
  stage: 'new' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number; // 0-100
  expected_close_date?: string;
  actual_close_date?: string;
  lost_reason?: string;
  pipeline_id?: string;
  created_at: string;
  updated_at: string;
}
```

### Activity

```typescript
interface Activity {
  id: string;
  user_id: string;
  lead_id?: string;
  deal_id?: string;
  type: 'email' | 'call' | 'meeting' | 'task' | 'note';
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  due_date?: string;
  completed_at?: string;
  result?: string;
  participants?: string[]; // User IDs
  reminder: boolean;
  created_at: string;
  updated_at: string;
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: 'admin' | 'sales' | 'viewer';
  team_id?: string;
  timezone: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
  created_at: string;
  updated_at: string;
}
```

### CreditUsage

```typescript
interface CreditUsage {
  id: string;
  user_id: string;
  credits_used: number;
  action: 'enrich_lead' | 'verify_email' | 'find_contacts';
  lead_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
```

---

## 🛠️ Utilities

### formatCurrency

```typescript
import { formatCurrency } from '@/lib/utils';

formatCurrency(5000);        // "R$ 5.000,00"
formatCurrency(1234.56);     // "R$ 1.234,56"
formatCurrency(1000, 'USD'); // "$1,000.00"
```

### cn (Class Name Utility)

```typescript
import { cn } from '@/lib/utils';

cn('base-class', { 'active': isActive, 'disabled': isDisabled });
// Retorna: "base-class active" (se isActive=true, isDisabled=false)
```

### validateEmail

```typescript
import { validateEmail } from '@/lib/utils';

validateEmail('john@example.com');  // true
validateEmail('invalid-email');     // false
```

### formatPhoneNumber

```typescript
import { formatPhoneNumber } from '@/lib/utils';

formatPhoneNumber('11987654321');  // "(11) 98765-4321"
formatPhoneNumber('+5511987654321'); // "+55 (11) 98765-4321"
```

---

## 🎨 Componentes Reutilizáveis

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg" onClick={handleClick}>
  Clique Aqui
</Button>

// Variantes: default, destructive, outline, secondary, ghost, link
// Tamanhos: sm, md, lg, icon
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmação</DialogTitle>
      <DialogDescription>
        Tem certeza que deseja continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Table

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {leads.map((lead) => (
      <TableRow key={lead.id}>
        <TableCell>{lead.name}</TableCell>
        <TableCell>{lead.email}</TableCell>
        <TableCell>{lead.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Form (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido')
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  );
}
```

---

## 🔐 Autenticação

### Row Level Security (RLS)

Todas as tabelas usam RLS para garantir que usuários só acessem seus próprios dados.

**Exemplo**: Política para tabela `leads`

```sql
-- Política de SELECT
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

-- Política de INSERT
CREATE POLICY "Users can create own leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE
CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = user_id);

-- Política de DELETE
CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 📊 Rate Limits

### Hunter.io

| Plano | Requests/mês | Requests/segundo |
|-------|-------------|------------------|
| Free | 50 | 1 |
| Starter | 500 | 5 |
| Growth | 10,000 | 10 |
| Business | 50,000 | 20 |

### LinkedIn Scraper

- **Limit**: 100 perfis/dia (Free), 1000/dia (Pro)
- **Cooldown**: 2 segundos entre requests

### Supabase Edge Functions

- **Limit**: 500,000 invocações/mês (Free), 2M/mês (Pro)
- **Timeout**: 60 segundos por invocação

---

## 🧪 Testing

### Executar Testes

```bash
# Todos os testes
npm test

# Com UI
npm run test:ui

# Coverage
npm run test:coverage
```

### Exemplo de Teste de Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useLeads } from '@/hooks/useLeads';

describe('useLeads', () => {
  it('should fetch leads on mount', async () => {
    const { result } = renderHook(() => useLeads());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.leads.length).toBeGreaterThan(0);
  });
});
```

---

## 🚀 Deploy

### Variáveis de Ambiente

```bash
# Supabase
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Hunter.io
VITE_HUNTER_API_KEY=your-hunter-api-key

# Sentry (opcional)
VITE_SENTRY_DSN=https://...
```

### Build

```bash
npm run build
```

Arquivos gerados em `dist/`:
- 48 chunks otimizados
- Total: ~1.5MB gzipped
- Lazy loading ativado

---

## 📚 Links Úteis

- [Supabase Documentation](https://supabase.com/docs)
- [Hunter.io API Reference](https://hunter.io/api-documentation)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0

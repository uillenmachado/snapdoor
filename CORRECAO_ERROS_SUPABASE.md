# 🔧 CORREÇÃO CRÍTICA DOS ERROS - SUPABASE

**Data:** 15 de Outubro de 2025  
**Status:** ⚠️ AÇÃO NECESSÁRIA

---

## 🐛 ERROS IDENTIFICADOS E SOLUÇÕES

### 1. ❌ Erro 404 - Tabelas Não Encontradas

**Erro:**
```
cfydbvrzjtbcrbzimfjm.supabase.co/rest/v1/credit_packages?select=*&is_active=eq.true&order=credits.asc
Failed to load resource: the server responded with a status of 404 ()

cfydbvrzjtbcrbzimfjm.supabase.co/rest/v1/meetings?select=*&user_id=eq.d6d9a307...
Failed to load resource: the server responded with a status of 404 ()
```

**Causa:**
As tabelas `credit_packages` e `meetings` existem nas migrations locais mas não foram criadas no Supabase em produção.

**Solução:**

#### Passo 1: Acessar SQL Editor do Supabase
1. Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new
2. Login com sua conta

#### Passo 2: Executar Migration de Credit_Packages

Copie e execute este SQL:

```sql
-- ============================================
-- CREDIT SYSTEM - Tabelas de Créditos
-- ============================================

-- Tabela de pacotes de créditos
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  price_brl DECIMAL(10, 2) NOT NULL CHECK (price_brl >= 0),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer usuário autenticado pode ver pacotes ativos
CREATE POLICY "Anyone can view active credit packages"
  ON credit_packages FOR SELECT
  USING (is_active = true);

-- Inserir pacotes padrão
INSERT INTO credit_packages (name, credits, price_brl, discount_percentage) VALUES
  ('Starter', 100, 49.90, 0),
  ('Professional', 500, 199.90, 20),
  ('Business', 1000, 349.90, 30),
  ('Enterprise', 5000, 1499.90, 40)
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_credit_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_packages_updated_at();

-- Comentários
COMMENT ON TABLE credit_packages IS 'Pacotes de créditos disponíveis para compra';
COMMENT ON COLUMN credit_packages.credits IS 'Quantidade de créditos no pacote';
COMMENT ON COLUMN credit_packages.price_brl IS 'Preço em Reais (BRL)';
COMMENT ON COLUMN credit_packages.discount_percentage IS 'Desconto percentual aplicado';
```

#### Passo 3: Criar Tabela Meetings (se necessário)

**⚠️ IMPORTANTE:** Antes de criar, verifique se sua aplicação realmente usa meetings. Se não usar, pode comentar/remover o código que tenta buscar desta tabela.

```sql
-- ============================================
-- MEETINGS - Tabela de Reuniões
-- ============================================

CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(255),
  meeting_type VARCHAR(50) DEFAULT 'physical' CHECK (meeting_type IN ('physical', 'online', 'phone')),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Habilitar RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own meetings"
  ON meetings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_meetings_updated_at();

-- Comentários
COMMENT ON TABLE meetings IS 'Reuniões agendadas com leads';
COMMENT ON COLUMN meetings.meeting_type IS 'Tipo: physical, online, phone';
COMMENT ON COLUMN meetings.status IS 'Status: scheduled, in_progress, completed, cancelled';
```

#### Passo 4: Verificar Tabelas Criadas

Execute para confirmar:

```sql
SELECT tablename, schemaname 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('credit_packages', 'meetings')
ORDER BY tablename;
```

**Resultado esperado:**
```
tablename         | schemaname
------------------+-----------
credit_packages   | public
meetings          | public
```

---

### 2. ❌ Erro 400 - Queries Mal Formatadas (deals)

**Erro:**
```
cfydbvrzjtbcrbzimfjm.supabase.co/rest/v1/deals?select=*&user_id=eq.d6d9a307-73f9-46d6-aee2-e28e5c397a01&order=position.asc
Failed to load resource: the server responded with a status of 400 ()
```

**Causa Provável:**
- Coluna `position` pode não existir na tabela `deals`
- Ou RLS bloqueando acesso

**Solução:**

#### Verificar Estrutura da Tabela Deals

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'deals'
ORDER BY ordinal_position;
```

#### Adicionar Coluna Position (se não existir)

```sql
-- Adicionar coluna position se não existir
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Atualizar posições existentes
WITH numbered_deals AS (
  SELECT id, user_id, stage_id,
         ROW_NUMBER() OVER (PARTITION BY stage_id ORDER BY created_at) - 1 AS new_position
  FROM deals
)
UPDATE deals
SET position = numbered_deals.new_position
FROM numbered_deals
WHERE deals.id = numbered_deals.id;
```

#### Verificar Políticas RLS

```sql
-- Ver políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'deals';
```

**Se não houver políticas, criar:**

```sql
-- Habilitar RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
CREATE POLICY "Users can view their own deals"
  ON deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deals"
  ON deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
  ON deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
  ON deals FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 3. ❌ Erro 409 - Constraint Violada (stages)

**Erro:**
```
POST https://cfydbvrzjtbcrbzimfjm.supabase.co/rest/v1/stages?select=* 409 (Conflict)
duplicate key value violates unique constraint "stages_name_pipeline_unique"
```

**Causa:**
Tentativa de criar um stage com nome duplicado no mesmo pipeline.

**Soluções:**

#### Opção A: Remover Constraint (permite duplicatas)

```sql
-- Remover constraint único se você QUER permitir nomes duplicados
ALTER TABLE stages 
DROP CONSTRAINT IF EXISTS stages_name_pipeline_unique;
```

#### Opção B: Manter Constraint (recomendado) + Corrigir Código

**Manter a constraint** e adicionar validação no frontend:

**Arquivo:** `src/hooks/usePipelines.ts` (ou onde cria stages)

```typescript
export const useCreateStage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newStage: { name: string; pipeline_id: string; position: number }) => {
      // ✅ VALIDAÇÃO: Verificar se nome já existe
      const { data: existing } = await supabase
        .from("stages")
        .select("id")
        .eq("pipeline_id", newStage.pipeline_id)
        .eq("name", newStage.name)
        .single();

      if (existing) {
        throw new Error(`O stage "${newStage.name}" já existe neste pipeline.`);
      }

      // Criar stage
      const { data, error } = await supabase
        .from("stages")
        .insert([newStage])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      toast.success("Stage criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar stage");
    },
  });
};
```

#### Verificar Stages Duplicados Existentes

```sql
-- Ver stages duplicados
SELECT pipeline_id, name, COUNT(*) 
FROM stages 
GROUP BY pipeline_id, name 
HAVING COUNT(*) > 1;
```

**Se houver duplicatas, deletar:**

```sql
-- Deletar duplicatas (mantém apenas o mais antigo)
DELETE FROM stages a
USING stages b
WHERE a.id > b.id 
AND a.pipeline_id = b.pipeline_id 
AND a.name = b.name;
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Depois de executar os SQLs, verificar:

- [ ] ✅ Tabela `credit_packages` criada e com dados
  ```sql
  SELECT * FROM credit_packages LIMIT 5;
  ```

- [ ] ✅ Tabela `meetings` criada (se necessário)
  ```sql
  SELECT COUNT(*) FROM meetings;
  ```

- [ ] ✅ Tabela `deals` tem coluna `position`
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'deals' AND column_name = 'position';
  ```

- [ ] ✅ Políticas RLS configuradas para `deals`
  ```sql
  SELECT policyname FROM pg_policies WHERE tablename = 'deals';
  ```

- [ ] ✅ Constraint de `stages` mantida ou validação no código implementada

---

## 🧪 TESTAR APLICAÇÃO

Após aplicar correções:

1. **Limpar cache do browser** (Ctrl + Shift + Del)
2. **Reload hard** (Ctrl + F5)
3. **Verificar console** (F12 → Console)
4. **Testar funcionalidades:**
   - ✅ Dashboard carrega sem erros
   - ✅ Deals aparecem corretamente
   - ✅ Créditos são exibidos
   - ✅ Criar novo stage funciona

---

## 📋 RESUMO EXECUTIVO

| Erro | Tabela | Ação | Status |
|------|--------|------|--------|
| 404 | credit_packages | Criar tabela + dados | ⏳ Executar SQL |
| 404 | meetings | Criar tabela (opcional) | ⏳ Decidir se necessário |
| 400 | deals | Adicionar coluna position | ⏳ Executar SQL |
| 400 | deals | Configurar RLS | ⏳ Executar SQL |
| 409 | stages | Validar antes de criar | ⏳ Corrigir código |

---

## 🚀 APÓS CORREÇÕES

1. **Commit das mudanças:**
   ```bash
   git add .
   git commit -m "fix(database): apply missing migrations and fix RLS policies"
   git push origin master
   ```

2. **Redeploy automático no Vercel** (se conectado ao Git)

3. **Testar em produção:** https://snapdoor.vercel.app

---

**Data de Criação:** 15 de Outubro de 2025  
**Prioridade:** 🔴 CRÍTICA  
**Tempo Estimado:** 15-20 minutos

**Próxima Ação:** Executar SQLs no Supabase Dashboard AGORA!

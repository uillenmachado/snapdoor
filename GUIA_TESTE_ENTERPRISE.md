# 🚀 GUIA DE APLICAÇÃO E TESTE - SISTEMA DE OPORTUNIDADES ENTERPRISE

## 📋 PASSO 1: Aplicar Migration no Supabase

### Opção A: Via SQL Editor (Recomendado)
1. Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/editor
2. Clique em **"SQL Editor"** no menu lateral
3. Clique em **"New query"**
4. Cole o conteúdo do arquivo `APPLY_THIS_MIGRATION.sql`
5. Clique em **"Run"** (ou pressione Ctrl+Enter)
6. Aguarde a mensagem: **"Success. No rows returned"**

### Opção B: Via Supabase CLI (Alternativa)
```powershell
cd "c:\Users\Uillen Machado\Documents\Meus projetos\snapdoor"
cd supabase
npx supabase db push
```

### ✅ Validar Migration
Execute esta query no SQL Editor para confirmar:
```sql
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'deal_participants' 
ORDER BY ordinal_position;
```

**Resultado esperado:**
- id (uuid)
- deal_id (uuid)
- lead_id (uuid)
- user_id (uuid)
- role (text)
- is_primary (boolean)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

---

## 🧪 PASSO 2: Testar o Fluxo Completo

### 2.1 Criar uma Oportunidade

1. **Acesse**: http://localhost:8080/pipelines
2. **Clique** em "Nova Oportunidade" (botão verde)
3. **Preencha** a Etapa 1:
   - Nome: "CRM Corporativo - Equipe B2B"
   - Valor: 180000
   - Empresa: "Teste Corp"
   - Etapa: (deixar a primeira)
   - Probabilidade: 70%
   - Data Prevista: (selecione uma data futura)
   - Descrição: "Implementação de CRM..."

4. **Clique** em "Próximo: Adicionar Contatos"

### 2.2 Adicionar Participantes

1. **Clique** no campo "Buscar Contato"
2. **Digite** o nome de um lead existente
3. **Selecione** o lead na lista
4. **Quando perguntar** "Este contato é um decisor?":
   - Clique **OK** se for decisor
   - Clique **Cancelar** para participante normal
5. **Repita** para adicionar mais contatos
6. **Ajuste os papéis** usando o dropdown (Decisor, Influenciador, etc.)
7. **Clique** em "Criar Oportunidade"

### 2.3 Verificar o Console

Abra o DevTools (F12) e observe as mensagens:
```
🔍 Criando deal: {...}
✅ Deal criado com sucesso: { id: "uuid-aqui", ... }
🔍 Adicionando participante: {...}
✅ Participante adicionado: {...}
```

**Se aparecer erro 400:**
- A tabela `deal_participants` NÃO foi criada ainda
- Volte ao PASSO 1 e aplique a migration

---

## 🐛 PASSO 3: Diagnóstico de Problemas

### Erro: "Failed to load resource: 400"

**Causa**: Tabela `deal_participants` não existe no banco
**Solução**: Aplicar migration do PASSO 1

### Erro: "id=eq.new"

**Causa**: Deal não foi criado, ID inválido retornado
**Solução**: 
1. Verifique se o campo `status` existe na tabela `deals`
2. Execute no SQL Editor:
```sql
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' 
CHECK (status IN ('open', 'won', 'lost'));
```

### Erro: "Nenhum lead encontrado"

**Causa**: Não há leads cadastrados no sistema
**Solução**: 
1. Acesse http://localhost:8080/leads
2. Clique em "Novo Lead"
3. Cadastre ao menos 2 leads
4. Volte para criar a oportunidade

### Console mostra erros de permissão (RLS)

**Solução**: Verificar se as políticas RLS estão ativas
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'deal_participants';
```

---

## 🎨 PASSO 4: Verificar Logo Integrado

### Locais onde o logo deve aparecer:

1. **✅ Aba do Navegador**
   - Favicon SVG azul/roxo
   - Visível na aba e favoritos

2. **✅ Página de Login**
   - Logo grande centralizado
   - Acima de "Bem-vindo de volta"

3. **✅ Página de Signup**
   - Logo grande centralizado
   - Acima de "Criar conta"

4. **✅ Sidebar (Menu Lateral)**
   - Logo médio no topo
   - Visível em todas as páginas internas

### Para adicionar seu logo PNG:

1. Coloque `logo.png` na pasta `public/`
2. Edite `src/components/Logo.tsx`:
   ```typescript
   // Linha 34 - DESCOMENTAR:
   return <img src="/logo.png" alt="SnapDoor" className={`${sizeClasses[size]} ${className}`} />;
   
   // Linhas 36-53 - REMOVER ou comentar o fallback SVG
   ```
3. Recarregue a página (Ctrl+R)

---

## 📊 PASSO 5: Validar Dados no Supabase

### Verificar deals criados:
```sql
SELECT 
  id, 
  title, 
  value, 
  company_name, 
  status,
  created_at
FROM public.deals
ORDER BY created_at DESC
LIMIT 5;
```

### Verificar participantes vinculados:
```sql
SELECT 
  dp.id,
  dp.role,
  dp.is_primary,
  d.title as deal_title,
  l.first_name || ' ' || l.last_name as lead_name,
  l.company as lead_company
FROM public.deal_participants dp
JOIN public.deals d ON dp.deal_id = d.id
JOIN public.leads l ON dp.lead_id = l.id
ORDER BY dp.created_at DESC
LIMIT 10;
```

### Verificar contagem:
```sql
SELECT 
  d.title,
  COUNT(dp.id) as total_participantes,
  COUNT(CASE WHEN dp.is_primary THEN 1 END) as contatos_principais
FROM public.deals d
LEFT JOIN public.deal_participants dp ON d.id = dp.deal_id
GROUP BY d.id, d.title
ORDER BY d.created_at DESC;
```

---

## 🎯 RESULTADO ESPERADO

### Antes (não funcional):
- ❌ Criar deal sem contatos
- ❌ Erro 400 ao buscar participantes
- ❌ "Sem empresa" em todos os leads
- ❌ Logo padrão sem identidade

### Depois (enterprise):
- ✅ Deal exige: nome, valor, empresa, contatos
- ✅ Participantes com papéis definidos
- ✅ Primeiro contato marcado como principal
- ✅ Validações em tempo real
- ✅ Logo integrado em 4 locais
- ✅ Feedback visual profissional
- ✅ Console com logs detalhados

---

## 📞 SUPORTE

### Problemas comuns e soluções:

**"Cannot read property 'id' of undefined"**
→ Deal não foi criado. Verificar campo `status` na tabela.

**"duplicate key value violates unique constraint"**
→ Lead já está adicionado ao deal. Normal, apenas aviso.

**"permission denied for table deal_participants"**
→ RLS ativo mas sem políticas. Aplicar migration completa.

**"Nenhum contato adicionado ainda"**
→ Estado correto! Adicione pelo menos 1 contato.

---

## 🚀 DEPLOY EM PRODUÇÃO

Após validar localmente:

1. **Commit das mudanças:**
```powershell
git add .
git commit -m "feat: sistema enterprise de criação de oportunidades com participantes"
git push origin master
```

2. **Aplicar migration na produção:**
   - Acesse o SQL Editor do projeto de produção
   - Execute `APPLY_THIS_MIGRATION.sql`
   - Valide com as queries de verificação

3. **Monitorar logs:**
   - Console do navegador
   - Supabase Dashboard → Logs
   - Sentry (se configurado)

---

**Tudo pronto! 🎉**

Este é o sistema mais completo de criação de oportunidades, seguindo as melhores práticas do Pipedrive. Qualquer dúvida, consulte os logs do console.

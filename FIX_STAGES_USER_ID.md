# 🔧 FIX RÁPIDO: stages.user_id não existe

## ❌ ERRO
```
column stages.user_id does not exist
```

## 🔍 CAUSA
Tabela `stages` está vinculada a `pipelines`, não diretamente ao usuário:

```sql
CREATE TABLE stages (
  id UUID,
  pipeline_id UUID, -- ✅ Via pipeline
  -- user_id UUID  -- ❌ NÃO EXISTE
  ...
);
```

## ✅ SOLUÇÃO

### Buscar stage via pipeline:

```typescript
// 1. Buscar pipeline do usuário
const { data: userPipelines } = await supabase
  .from('pipelines')
  .select('id')
  .eq('user_id', userId)
  .limit(1)
  .single();

// 2. Buscar primeiro stage deste pipeline
const { data: userStages } = await supabase
  .from('stages')
  .select('id')
  .eq('pipeline_id', userPipelines.id) // ✅ Via pipeline
  .order('position', { ascending: true })
  .limit(1)
  .single();

// 3. Usar stage_id no lead
{
  stage_id: userStages.id
}
```

## 🧪 TESTE
```
Ctrl+Shift+R → Criar lead inline

Console:
✅ Pipeline: uuid
✅ Stage: uuid  
✅ Lead criado: {...}
```

**Status:** ✅ CORRIGIDO

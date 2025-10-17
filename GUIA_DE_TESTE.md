# 🧪 Guia de Teste - Histórico de Oportunidades

## ✅ Pré-requisitos
- [x] SQL aplicado no Supabase
- [x] Aplicação rodando (localhost:8080)

---

## 🔬 Teste 1: Marcar Negócio como Ganho

### Passos:
1. **Acesse**: http://localhost:8080/pipelines
2. **Abra uma oportunidade** no kanban
3. **Clique em**: "Marcar como Ganho" ✅
4. **Observe**:
   - Toast verde: "🎉 Negócio ganho! Parabéns!"
   - Negócio desaparece do pipeline

### Verificar:
5. **Acesse**: http://localhost:8080/deals/history
6. **Deve aparecer**:
   - Card "Oportunidades Ganhas": +1
   - Badge verde "Ganho" na tabela
   - Data de atualização recente

---

## 🔬 Teste 2: Marcar Negócio como Perdido

### Passos:
1. **Acesse**: http://localhost:8080/pipelines
2. **Abra uma oportunidade** no kanban
3. **Clique em**: "Marcar como Perdido" ❌
4. **Digite o motivo**: Ex: "Preço muito alto"
5. **Confirme**
6. **Observe**:
   - Toast: "Negócio marcado como perdido"
   - Negócio desaparece do pipeline

### Verificar:
7. **Acesse**: http://localhost:8080/deals/history
8. **Deve aparecer**:
   - Card "Oportunidades Perdidas": +1
   - Badge vermelho "Perdido" na tabela
   - Motivo da perda (se clicar em detalhes)

---

## 🔬 Teste 3: Filtros do Histórico

### Passos:
1. **Acesse**: http://localhost:8080/deals/history
2. **Teste o dropdown** "Todos os status":
   - Selecione "Ganho" → deve mostrar só ganhos
   - Selecione "Perdido" → deve mostrar só perdidos
   - Selecione "Em Aberto" → deve mostrar só abertos
   - Selecione "Todos" → deve mostrar tudo

3. **Teste a busca**:
   - Digite nome de uma oportunidade
   - Digite nome de uma empresa
   - Tabela deve filtrar em tempo real

---

## 🔬 Teste 4: KPIs Corretos

### Dashboard:
1. **Acesse**: http://localhost:8080/dashboard
2. **Verifique card** "Total de Negócios":
   - Deve mostrar apenas negócios ABERTOS
   - Ex: Se tem 2 abertos, deve mostrar "2"

### Pipeline:
3. **Acesse**: http://localhost:8080/pipelines
4. **Verifique card** "Total de Negócios":
   - Deve mostrar apenas negócios ABERTOS
   - Kanban deve mostrar apenas negócios ABERTOS

### Histórico:
5. **Acesse**: http://localhost:8080/deals/history
6. **Verifique cards**:
   - "Total de Oportunidades": todos (abertos + fechados)
   - "Oportunidades Ganhas": apenas ganhos
   - "Oportunidades Perdidas": apenas perdidos

---

## 🔬 Teste 5: Reabrir Negócio

### Passos:
1. **Acesse**: http://localhost:8080/deals/history
2. **Filtre por**: "Ganho" ou "Perdido"
3. **Clique no ícone** 🔄 (Reabrir)
4. **Confirme** no diálogo
5. **Observe**:
   - Toast: "Oportunidade reaberta com sucesso!"
   - Negócio volta para filtro "Em Aberto"

### Verificar:
6. **Acesse**: http://localhost:8080/pipelines
7. **Negócio deve aparecer** no kanban novamente

---

## 🔬 Teste 6: Favicon e Nome

### Verificar em todas as páginas:
- [x] Landing (http://localhost:8080)
- [x] Login (http://localhost:8080/login)
- [x] Signup (http://localhost:8080/signup)
- [x] Dashboard (http://localhost:8080/dashboard)
- [x] Pipeline (http://localhost:8080/pipelines)
- [x] Histórico (http://localhost:8080/deals/history)

### Deve ter:
- ✅ Favicon ao lado do nome
- ✅ Nome "snapdoor" em minúsculo
- ✅ Cor azul primária (text-primary)

---

## ✅ Checklist de Validação

### Funcionalidades:
- [ ] Negócio ganho aparece no histórico
- [ ] Negócio perdido aparece no histórico
- [ ] Filtros funcionam corretamente
- [ ] Busca funciona corretamente
- [ ] KPI Dashboard mostra apenas abertos
- [ ] KPI Pipeline mostra apenas abertos
- [ ] Reabrir negócio funciona
- [ ] Cards de estatísticas corretos

### Visual:
- [ ] Favicon em todas as páginas
- [ ] Nome "snapdoor" padronizado
- [ ] Badges coloridos por status
- [ ] Slogan novo na landing

---

## 🐛 Se Algo Não Funcionar

### Console do Navegador (F12):
1. **Abra** DevTools (F12)
2. **Vá para** Console
3. **Procure por erros** em vermelho
4. **Copie** mensagem de erro

### Supabase:
1. **Verifique** se a migration foi aplicada:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'deals' 
   AND column_name IN ('won_at', 'lost_at');
   ```
   Deve retornar 2 linhas.

2. **Verifique** dados existentes:
   ```sql
   SELECT status, won_at, lost_at 
   FROM deals 
   WHERE status IN ('won', 'lost');
   ```

---

## 📸 Evidências Esperadas

### Histórico deve mostrar:
```
┌─────────────────────────────────────────────┐
│ Total de Oportunidades: 5                   │
│ 0 em aberto                                 │
├─────────────────────────────────────────────┤
│ Oportunidades Ganhas: 2                     │
│ R$ 50.000,00                                │
├─────────────────────────────────────────────┤
│ Oportunidades Perdidas: 3                   │
│ 0 excluídas                                 │
└─────────────────────────────────────────────┘

Tabela:
┌────────────┬──────────┬──────────┬────────┐
│ Nome       │ Empresa  │ Valor    │ Status │
├────────────┼──────────┼──────────┼────────┤
│ Deal A     │ Acme     │ R$ 30k   │ ✅ Ganho│
│ Deal B     │ Corp     │ R$ 20k   │ ✅ Ganho│
│ Deal C     │ Ltd      │ R$ 10k   │ ❌ Perdido│
└────────────┴──────────┴──────────┴────────┘
```

---

**Agora teste tudo e me avise se algo não funcionar!** 🚀

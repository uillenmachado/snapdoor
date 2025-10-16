-- Diagnóstico: Leads com empresas (primeiros 5)
SELECT 
  l.id::text,
  l.first_name || ' ' || l.last_name as nome,
  l.company_id::text,
  c.name as company_nome,
  l.title as title_cargo,
  l.headline,
  CASE 
    WHEN l.company_id IS NULL THEN '⚠️ COMPANY_ID NULL'
    WHEN c.id IS NULL THEN '❌ EMPRESA NÃO EXISTE'
    WHEN l.title IS NULL AND l.headline IS NULL THEN '⚠️ SEM CARGO'
    ELSE '✅ OK'
  END as status
FROM leads l
LEFT JOIN companies c ON l.company_id = c.id
WHERE l.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
LIMIT 5;

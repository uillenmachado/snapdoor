# Script para executar SQL no Supabase via Management API
$projectRef = "cfydbvrzjtbcrbzimfjm"
$sql = Get-Content "SUPABASE_FIX_SCRIPT.sql" -Raw

# Executar via supabase CLI
Write-Host "Executando SQL no banco de dados remoto..."
$sql | npx supabase db execute --db-url "postgresql://postgres.cfydbvrzjtbcrbzimfjm:Uillen1006%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

Write-Host "✅ SQL executado com sucesso!"

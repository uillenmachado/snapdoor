# Script para aplicar migration via Supabase Management API
# Requer service_role key (encontrada nas env vars do projeto)

$projectRef = "cfydbvrzjtbcrbzimfjm"
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $serviceRoleKey) {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY não encontrada nas variáveis de ambiente"
    Write-Host ""
    Write-Host "📋 Por favor, execute manualmente no Supabase Dashboard:"
    Write-Host "   https://supabase.com/dashboard/project/$projectRef/sql/new"
    Write-Host ""
    Get-Content "apply-migration-now.sql"
    exit 1
}

$sql = Get-Content "apply-migration-now.sql" -Raw

$headers = @{
    "apikey" = $serviceRoleKey
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
}

$body = @{
    query = $sql
} | ConvertTo-Json

Write-Host "🚀 Aplicando migration..."

try {
    $response = Invoke-RestMethod -Uri "https://$projectRef.supabase.co/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Migration aplicada com sucesso!"
    Write-Host $response
} catch {
    Write-Host "❌ Erro ao aplicar migration:"
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "📋 Aplique manualmente no Supabase Dashboard:"
    Write-Host "   https://supabase.com/dashboard/project/$projectRef/sql/new"
    exit 1
}

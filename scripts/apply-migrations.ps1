# =====================================================
# SCRIPT POWERSHELL - APLICAR TODAS MIGRATIONS
# Aplica automaticamente as 4 migrations no Supabase
# =====================================================

$PROJECT_URL = "https://cfydbvrzjtbcrbzimfjm.supabase.co"
$MIGRATIONS_DIR = "C:\Users\Uillen Machado\Documents\Meus projetos\snapdoor\supabase\migrations"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE MIGRATION APPLIER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Lista de migrations na ordem correta
$migrations = @(
    @{
        Name = "V2 - Fix All Tables"
        File = "20251010000002_fix_all_tables_v2.sql"
        Description = "Cria 11 tabelas + 6 estágios + 10 créditos iniciais"
    },
    @{
        Name = "V3 - Dev Account Unlimited Credits"
        File = "20251010000003_dev_account_unlimited_credits.sql"
        Description = "Configura créditos ilimitados para uillenmachado@gmail.com"
    },
    @{
        Name = "V4 - Fix User Credits RLS"
        File = "20251010000004_fix_user_credits_rls.sql"
        Description = "Corrige RLS policies (resolve erro 406/403)"
    },
    @{
        Name = "V5 - Add Leads Source Column"
        File = "20251010000005_add_leads_source_column.sql"
        Description = "Adiciona coluna source (resolve erro 400)"
    }
)

Write-Host "📋 Migrations a aplicar:" -ForegroundColor Yellow
foreach ($migration in $migrations) {
    Write-Host "  ✓ $($migration.Name)" -ForegroundColor White
    Write-Host "    → $($migration.Description)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Você precisará aplicar estas migrations MANUALMENTE no Supabase Dashboard" -ForegroundColor White
Write-Host "   pois o Supabase CLI não está instalado." -ForegroundColor White
Write-Host ""

$response = Read-Host "Deseja abrir o Supabase SQL Editor agora? (S/N)"

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "🌐 Abrindo Supabase SQL Editor..." -ForegroundColor Green
    Start-Process "https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new"
    
    Write-Host ""
    Write-Host "📝 INSTRUÇÕES:" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($i in 0..($migrations.Length - 1)) {
        $migration = $migrations[$i]
        $num = $i + 1
        
        Write-Host "PASSO $num - $($migration.Name)" -ForegroundColor Yellow
        Write-Host "  1. Clique em '+ New Query' no SQL Editor" -ForegroundColor White
        Write-Host "  2. Abra o arquivo:" -ForegroundColor White
        Write-Host "     $MIGRATIONS_DIR\$($migration.File)" -ForegroundColor Cyan
        Write-Host "  3. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)" -ForegroundColor White
        Write-Host "  4. Cole no SQL Editor do Supabase" -ForegroundColor White
        Write-Host "  5. Clique em 'RUN' ou pressione Ctrl+Enter" -ForegroundColor White
        Write-Host "  6. Aguarde 'Success. No rows returned'" -ForegroundColor Green
        Write-Host ""
    }
    
    Write-Host "✅ APÓS APLICAR TODAS:" -ForegroundColor Green
    Write-Host "   Execute no SQL Editor para validar:" -ForegroundColor White
    Write-Host ""
    Write-Host "   SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" -ForegroundColor Cyan
    Write-Host "   -- Deve retornar: 11" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   SELECT is_dev_account('uillenmachado@gmail.com');" -ForegroundColor Cyan
    Write-Host "   -- Deve retornar: true" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "❌ Operação cancelada." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Para aplicar manualmente, acesse:" -ForegroundColor Yellow
    Write-Host "   https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Arquivos das migrations:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

foreach ($migration in $migrations) {
    $filePath = Join-Path $MIGRATIONS_DIR $migration.File
    if (Test-Path $filePath) {
        $fileSize = (Get-Item $filePath).Length
        Write-Host "✓ $($migration.File)" -ForegroundColor Green
        Write-Host "  Tamanho: $fileSize bytes" -ForegroundColor Gray
    } else {
        Write-Host "✗ $($migration.File) - ARQUIVO NÃO ENCONTRADO!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Script finalizado!" -ForegroundColor Green
Write-Host ""

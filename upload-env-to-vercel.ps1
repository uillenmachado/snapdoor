#!/usr/bin/env pwsh
# Script para fazer upload de TODAS as variáveis do .env.production para Vercel

Write-Host "🚀 Uploading environment variables to Vercel..." -ForegroundColor Green

# Ler arquivo .env.production
$envFile = Get-Content .env.production

foreach ($line in $envFile) {
    # Ignorar linhas vazias e comentários
    if ($line -match '^\s*$' -or $line -match '^\s*#') {
        continue
    }
    
    # Parse KEY=VALUE
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remover aspas do valor se existirem
        $value = $value -replace '^"(.*)"$', '$1'
        
        Write-Host "  Adding: $key" -ForegroundColor Cyan
        
        # Upload para Vercel (Production, Preview, Development)
        npx vercel env add $key production --force 2>&1 | Out-Null
        Write-Output $value | npx vercel env add $key production --force 2>&1 | Out-Null
        
        npx vercel env add $key preview --force 2>&1 | Out-Null
        Write-Output $value | npx vercel env add $key preview --force 2>&1 | Out-Null
        
        npx vercel env add $key development --force 2>&1 | Out-Null
        Write-Output $value | npx vercel env add $key development --force 2>&1 | Out-Null
    }
}

Write-Host ""
Write-Host "✅ All environment variables uploaded!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npx vercel --prod" -ForegroundColor White
Write-Host "  2. Wait 2-3 minutes for deployment" -ForegroundColor White
Write-Host "  3. Test signup at your production URL" -ForegroundColor White

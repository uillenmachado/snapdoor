#!/bin/bash

# =====================================================
# SCRIPT: Setup Supabase
# Configura projeto Supabase do zero
# =====================================================

set -e  # Exit on error

echo "🚀 SnapDoor CRM - Setup Supabase"
echo "================================="
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado"
    echo "Instale com: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Login no Supabase
echo "📝 Fazendo login no Supabase..."
supabase login

# Linkar ao projeto
echo ""
echo "🔗 Linkando ao projeto Supabase..."
read -p "Digite o Project Ref (da URL do dashboard): " PROJECT_REF
supabase link --project-ref $PROJECT_REF

# Aplicar migrações
echo ""
echo "🗄️  Aplicando migrações do banco de dados..."
supabase db push

# Deploy das Edge Functions
echo ""
echo "⚡ Fazendo deploy das Edge Functions..."

echo "  - Deploying search-leads..."
supabase functions deploy search-leads

echo "  - Deploying import-linkedin-profile..."
supabase functions deploy import-linkedin-profile

echo "  - Deploying bulk-import-linkedin..."
supabase functions deploy bulk-import-linkedin

echo "  - Deploying get-analytics..."
supabase functions deploy get-analytics

echo "  - Deploying create-automation..."
supabase functions deploy create-automation

# Criar bucket de storage para avatars
echo ""
echo "📦 Criando bucket de storage..."
supabase storage create avatars --public

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Configure OAuth providers no dashboard Supabase"
echo "2. Atualize .env.local com as credenciais"
echo "3. Execute 'npm run dev' para testar localmente"
echo ""
echo "Para ver logs das functions:"
echo "supabase functions logs [nome-da-function] --tail"
echo ""



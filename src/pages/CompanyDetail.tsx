/**
 * Página de detalhes da empresa
 * Mostra informações completas, leads e deals relacionados
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompany, useCompanyStats, useDeleteCompany } from '@/hooks/useCompanies';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Phone,
  Users,
  Briefcase,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { CompanyFormDialog } from '@/components/CompanyFormDialog';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: company, isLoading } = useCompany(id);
  const { data: stats } = useCompanyStats(id);
  const deleteMutation = useDeleteCompany();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id!);
    navigate('/companies');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Empresa não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          A empresa que você procura não existe ou foi removida.
        </p>
        <Button onClick={() => navigate('/companies')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Empresas
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header com Voltar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/companies')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Detalhes da Empresa</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de Informações Principais */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={company.logo_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(company.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{company.name}</CardTitle>
                  {company.domain && (
                    <CardDescription className="text-base">
                      {company.domain}
                    </CardDescription>
                  )}
                  <div className="flex gap-2 mt-3">
                    {company.industry && (
                      <Badge variant="secondary">{company.industry}</Badge>
                    )}
                    {company.size && (
                      <Badge variant="outline">{company.size}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {company.description && (
              <CardContent>
                <Separator className="mb-4" />
                <p className="text-muted-foreground">{company.description}</p>
              </CardContent>
            )}
          </Card>

          {/* Card de Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{company.location}</span>
                </div>
              )}

              {company.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                    {company.phone}
                  </a>
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {company.linkedin_url && (
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-muted-foreground" />
                  <a
                    href={company.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {company.twitter_url && (
                <div className="flex items-center gap-3">
                  <Twitter className="w-5 h-5 text-muted-foreground" />
                  <a
                    href={company.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Twitter/X
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {!company.location &&
                !company.phone &&
                !company.website &&
                !company.linkedin_url &&
                !company.twitter_url && (
                  <p className="text-muted-foreground text-sm">
                    Nenhuma informação de contato disponível
                  </p>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral - Estatísticas */}
        <div className="space-y-6">
          {/* Card de Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>Resumo da atividade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-2xl font-bold">{stats?.leadsCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deals</p>
                    <p className="text-2xl font-bold">{stats?.dealsCount || 0}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/leads?company=${id}`)}
              >
                <Users className="w-4 h-4 mr-2" />
                Ver Leads
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/deals?company=${id}`)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Deals
              </Button>
            </CardContent>
          </Card>

          {/* Card de Metadados */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em:</span>
                <span>{new Date(company.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atualizado em:</span>
                <span>{new Date(company.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{company.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Edição */}
      <CompanyFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        company={company}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A empresa <strong>{company.name}</strong> será
              permanentemente removida do sistema.
              {stats && (stats.leadsCount > 0 || stats.dealsCount > 0) && (
                <span className="block mt-2 text-amber-600 dark:text-amber-500">
                  ⚠️ Atenção: Esta empresa possui {stats.leadsCount} lead(s) e{' '}
                  {stats.dealsCount} deal(s) associados.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Deletar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

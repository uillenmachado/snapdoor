/**
 * Página de listagem de empresas
 * Lista, busca, filtra e gerencia empresas
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies, useDeleteCompany } from '@/hooks/useCompanies';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImportWizard } from '@/components/ImportWizard';
import { ExportDialog } from '@/components/ExportDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Upload,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompanyFilters, COMPANY_SIZES, INDUSTRIES } from '@/types/company';
import { CompanyFormDialog } from '@/components/CompanyFormDialog';

export default function Companies() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    industry: undefined,
    size: undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const { data, isLoading } = useCompanies(filters, page, 20);
  const deleteMutation = useDeleteCompany();

  const companies = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    setPage(1);
  };

  const handleIndustryFilter = (value: string) => {
    setFilters({ ...filters, industry: value === 'all' ? undefined : value });
    setPage(1);
  };

  const handleSizeFilter = (value: string) => {
    setFilters({ ...filters, size: value === 'all' ? undefined : value });
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Empresas
                  </h1>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowImportWizard(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
                <Button variant="outline" onClick={() => setShowExportDialog(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Empresa
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 space-y-6">
            {/* Filtros e Busca */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
                <CardDescription>Busque e filtre empresas</CardDescription>
              </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, domínio..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filters.industry || 'all'} onValueChange={handleIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Indústria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as indústrias</SelectItem>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.size || 'all'} onValueChange={handleSizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tamanhos</SelectItem>
                {COMPANY_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle>
            {totalCount} {totalCount === 1 ? 'empresa' : 'empresas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira empresa
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Empresa
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Indústria</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow
                      key={company.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/companies/${company.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={company.logo_url || undefined} />
                            <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{company.name}</div>
                            {company.domain && (
                              <div className="text-sm text-muted-foreground">
                                {company.domain}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.industry ? (
                          <Badge variant="secondary">{company.industry}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.size || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        {company.location || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Visitar
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/companies/${company.id}`);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(company.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar Empresa */}
      <CompanyFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A empresa será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import/Export Dialogs */}
      <ImportWizard
        open={showImportWizard}
        onOpenChange={setShowImportWizard}
        entityType="companies"
        onComplete={() => {
          // Recarregar dados após importação
          window.location.reload();
        }}
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        entityType="companies"
        filters={filters}
      />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

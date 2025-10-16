import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportWizard } from "@/components/ImportWizard";
import { ExportDialog } from "@/components/ExportDialog";
import { 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye, 
  Building2, 
  Mail, 
  Phone,
  Loader2,
  Users,
  TrendingUp,
  DollarSign,
  Target
} from "lucide-react";
import { Lead } from "@/hooks/useLeads";

interface LeadStats {
  total: number;
  won: number;
  lost: number;
  active: number;
  conversionRate: number;
}

export default function Leads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Buscar todos os leads do usuário
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["all-leads", user?.id, debouncedSearchQuery, statusFilter, companyFilter],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("leads")
        .select(`
          *,
          companies:company_id (
            id,
            name,
            domain,
            logo_url,
            industry
          )
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      // Filtro de status
      if (statusFilter !== "all") {
        if (statusFilter === "active") {
          query = query.eq("is_archived", false);
        } else if (statusFilter === "won") {
          query = query.eq("status", "won");
        } else if (statusFilter === "lost") {
          query = query.eq("status", "lost");
        }
      }

      // Filtro de empresa (usando company_id)
      if (companyFilter !== "all") {
        query = query.eq("company_id", companyFilter);
      }

      // Busca por texto (usando valor debounced)
      if (debouncedSearchQuery.trim()) {
        query = query.or(
          `first_name.ilike.%${debouncedSearchQuery}%,last_name.ilike.%${debouncedSearchQuery}%,email.ilike.%${debouncedSearchQuery}%,full_name.ilike.%${debouncedSearchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as any as Lead[];
    },
    enabled: !!user?.id,
  });

  // Calcular estatísticas
  const stats: LeadStats = {
    total: leads.length,
    won: leads.filter(l => l.status === "won").length,
    lost: leads.filter(l => l.status === "lost").length,
    active: leads.filter(l => !l.is_archived).length,
    conversionRate: leads.length > 0 
      ? Math.round((leads.filter(l => l.status === "won").length / leads.length) * 100) 
      : 0,
  };

  // Obter lista única de empresas (do JOIN)
  const companies = Array.from(
    new Map(
      leads
        .filter(l => l.companies)
        .map(l => [l.companies!.id, l.companies!])
    ).values()
  );

  // Função para exportar CSV
  const handleExportCSV = () => {
    const headers = ["Nome", "Empresa", "Cargo", "Email", "Telefone", "Status", "Criado em"];
    const rows = leads.map(lead => [
      lead.full_name || `${lead.first_name} ${lead.last_name}`,
      lead.companies?.name || "",
      lead.title || lead.headline || "",
      lead.email || "",
      lead.phone || "",
      lead.status || "",
      new Date(lead.created_at).toLocaleDateString("pt-BR"),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para obter badge de status - Pipedrive Style
  const getStatusBadge = (lead: Lead) => {
    if (lead.temperature === "hot") {
      return <Badge className="bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/30 border-0 font-medium">Quente</Badge>;
    } else if (lead.temperature === "cold") {
      return <Badge className="bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 hover:bg-danger-100 dark:hover:bg-danger-900/30 border-0 font-medium">Frio</Badge>;
    } else if (lead.temperature === "warm") {
      return <Badge className="bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 hover:bg-warning-100 dark:hover:bg-warning-900/30 border-0 font-medium">Morno</Badge>;
    }
    return <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-0 font-medium">Neutro</Badge>;
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Padronizado */}
          <PageHeader
            title="Leads"
            description="Gerencie seus leads e oportunidades"
            actions={
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportWizard(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </>
            }
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {/* Cards de Métricas Padronizados */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
              <MetricCard
                title="Total de Leads"
                value={stats.total}
                icon={<Users className="h-4 w-4" />}
              />
              
              <MetricCard
                title="Ativos"
                value={stats.active}
                icon={<Target className="h-4 w-4" />}
                variant="info"
              />
              
              <MetricCard
                title="Ganhos"
                value={stats.won}
                icon={<TrendingUp className="h-4 w-4" />}
                variant="success"
              />
              
              <MetricCard
                title="Perdidos"
                value={stats.lost}
                icon={<DollarSign className="h-4 w-4" />}
                variant="danger"
              />
              
              <MetricCard
                title="Taxa de Conversão"
                value={`${stats.conversionRate}%`}
              />
            </div>

            {/* Filtros e Busca */}
            <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="won">Ganhos</SelectItem>
                  <SelectItem value="lost">Perdidos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Tabela de Leads - Professional Style */}
          <div className="overflow-hidden">
            <Table>
              <caption className="sr-only">
                Lista de leads com informações de contato, empresa e status. 
                {leads.length} {leads.length === 1 ? 'lead encontrado' : 'leads encontrados'}.
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-medium text-muted-foreground">Nome</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Empresa</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Cargo</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Contato</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Atualizado</TableHead>
                  <TableHead className="w-24 font-medium text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-neutral-400 dark:text-neutral-600">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 opacity-40" />
                        <p className="font-medium">Nenhum lead encontrado</p>
                        <p className="text-sm">Tente ajustar os filtros de busca</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <TableCell className="py-4">
                        {lead.avatar_url ? (
                          <img
                            src={lead.avatar_url}
                            alt={`${lead.first_name} ${lead.last_name}`}
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-800"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-green-100 to-brand-green-200 dark:from-brand-green-900/30 dark:to-brand-green-800/30 flex items-center justify-center text-xs font-semibold text-brand-green-700 dark:text-brand-green-400 ring-2 ring-brand-green-200 dark:ring-brand-green-800/50">
                            {lead.first_name.charAt(0)}
                            {lead.last_name.charAt(0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-900 dark:text-neutral-100 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{lead.full_name || `${lead.first_name} ${lead.last_name}`}</span>
                          {lead.location && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{lead.location}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                          <Building2 className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                          <span className="font-medium">{lead.companies?.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-neutral-900 dark:text-neutral-100 py-4 font-medium">
                        {lead.title || lead.headline || "-"}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1.5 text-xs">
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                              <Mail className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                              <span className="truncate max-w-[150px] font-medium">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                              <Phone className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                              <span className="font-medium">{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">{getStatusBadge(lead)}</TableCell>
                      <TableCell className="text-sm text-neutral-700 dark:text-neutral-300 py-4 font-medium">
                        {formatDate(lead.updated_at)}
                      </TableCell>
                      <TableCell className="py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-brand-green-50 dark:hover:bg-brand-green-900/20 hover:text-brand-green-600 dark:hover:text-brand-green-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead.id}`);
                          }}
                          aria-label={`Ver detalhes de ${lead.full_name || `${lead.first_name} ${lead.last_name}`}`}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Dialogs */}
      <ImportWizard
        open={showImportWizard}
        onOpenChange={setShowImportWizard}
        entityType="leads"
        onComplete={() => {
          // Recarregar dados após importação
          window.location.reload();
        }}
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        entityType="leads"
        filters={{
          status: statusFilter !== "all" ? statusFilter : undefined,
          company: companyFilter !== "all" ? companyFilter : undefined,
        }}
      />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

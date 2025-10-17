import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Archive,
  RotateCcw,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DealHistory {
  id: string;
  title: string;
  value: number;
  status: 'open' | 'won' | 'lost' | 'deleted';
  created_at: string;
  updated_at: string;
  won_at?: string | null;
  lost_at?: string | null;
  lost_reason?: string | null;
  stage_name?: string;
  pipeline_name?: string;
  company_name?: string;
  probability?: number;
}

export default function DealsHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<DealHistory | null>(null);
  const [showReopenDialog, setShowReopenDialog] = useState(false);

  // Buscar histórico de deals
  const { data: deals = [], isLoading, refetch } = useQuery({
    queryKey: ['deals-history', user?.id, filterStatus],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('deals')
        .select(`
          *,
          stages:stage_id (
            name
          ),
          pipelines:pipeline_id (
            name
          ),
          companies:company_id (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Filtrar por status
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((deal: any) => ({
        id: deal.id,
        title: deal.title,
        value: deal.value,
        status: deal.status,
        created_at: deal.created_at,
        updated_at: deal.updated_at,
        won_at: deal.won_at,
        lost_at: deal.lost_at,
        lost_reason: deal.lost_reason,
        probability: deal.probability,
        stage_name: deal.stages?.name,
        pipeline_name: deal.pipelines?.name,
        company_name: deal.companies?.name,
      })) as DealHistory[];
    },
    enabled: !!user?.id,
  });

  // Filtrar por busca
  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const stats = {
    total: deals.length,
    open: deals.filter(d => d.status === 'open').length,
    won: deals.filter(d => d.status === 'won').length,
    lost: deals.filter(d => d.status === 'lost').length,
    deleted: deals.filter(d => d.status === 'deleted').length,
    totalValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
    wonValue: deals.filter(d => d.status === 'won').reduce((sum, d) => sum + (d.value || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; icon: any; className: string }> = {
      open: {
        label: 'Em Aberto',
        icon: Archive,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      },
      won: {
        label: 'Ganho',
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      },
      lost: {
        label: 'Perdido',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      },
      deleted: {
        label: 'Excluído',
        icon: Trash2,
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
      },
    };

    const config = variants[status] || variants.open;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleReopenDeal = async (deal: DealHistory) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          status: 'open',
          won_at: null,
          lost_at: null,
          lost_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deal.id);

      if (error) throw error;

      toast.success(`Oportunidade "${deal.title}" reaberta com sucesso!`);
      refetch();
      setShowReopenDialog(false);
      setSelectedDeal(null);
    } catch (error) {
      console.error('Erro ao reabrir oportunidade:', error);
      toast.error('Erro ao reabrir oportunidade');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <PageHeader
            title="Histórico de Oportunidades"
            description="Visualize e gerencie o histórico completo das suas oportunidades"
          />

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Cards de Estatísticas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total de Oportunidades</CardTitle>
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.open} em aberto
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Oportunidades Ganhas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.won}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(stats.wonValue)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Oportunidades Perdidas</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.deleted} excluídas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Todas as oportunidades
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por nome ou empresa..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="open">Em Aberto</SelectItem>
                        <SelectItem value="won">Ganho</SelectItem>
                        <SelectItem value="lost">Perdido</SelectItem>
                        <SelectItem value="deleted">Excluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando histórico...
                    </div>
                  ) : filteredDeals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma oportunidade encontrada
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Oportunidade</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Etapa</TableHead>
                          <TableHead>Atualizado</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDeals.map((deal) => (
                          <TableRow key={deal.id}>
                            <TableCell className="font-medium">{deal.title}</TableCell>
                            <TableCell>{deal.company_name || '-'}</TableCell>
                            <TableCell>{formatCurrency(deal.value)}</TableCell>
                            <TableCell>{getStatusBadge(deal.status)}</TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {deal.stage_name || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(deal.updated_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/deals/${deal.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {deal.status !== 'open' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDeal(deal);
                                      setShowReopenDialog(true);
                                    }}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Dialog de Reabrir Oportunidade */}
      <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reabrir Oportunidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja reabrir a oportunidade "{selectedDeal?.title}"?
              <br />
              <br />
              A oportunidade voltará para o status "Em Aberto" na etapa: <strong>{selectedDeal?.stage_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReopenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => selectedDeal && handleReopenDeal(selectedDeal)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reabrir Oportunidade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

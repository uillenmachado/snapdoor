import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Building2,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Plus,
  MoreVertical,
  Trash,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { EmailIntegrationCard } from "@/components/EmailIntegrationCard";
import { ParticipantCard } from "@/components/deals/ParticipantCard";
import { CompanyDetails } from "@/components/deals/CompanyDetails";
import { LeadDetails } from "@/components/deals/LeadDetails";
import { EmailComposer } from "@/components/EmailComposer";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import {
  useDeal,
  useUpdateDeal,
  useMarkDealAsWon,
  useMarkDealAsLost,
  Deal,
} from "@/hooks/useDeals";
import { useDealParticipants, useAddDealParticipant, useRemoveDealParticipant } from "@/hooks/useDeals";
import { useLeads, useCreateLead } from "@/hooks/useLeads";
import { supabase } from "@/integrations/supabase/client";

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: deal, isLoading: dealLoading } = useDeal(id);
  const { data: participants = [], isLoading: participantsLoading, refetch: refetchParticipants } = useDealParticipants(id);
  const { data: allLeads = [] } = useLeads(user?.id);
  
  // Debug - ver estrutura dos leads
  console.log('📊 Total de leads:', allLeads.length);
  console.log('📋 Primeiros 3 leads:', allLeads.slice(0, 3).map(l => ({
    id: l.id,
    name: l.name,
    email: l.email,
    company: l.company,
    job_title: l.job_title
  })));
  
  // Primeiro participante é o principal
  const primaryParticipant = participants[0];

  const updateDealMutation = useUpdateDeal();
  const markAsWonMutation = useMarkDealAsWon();
  const markAsLostMutation = useMarkDealAsLost();
  const addParticipantMutation = useAddDealParticipant();
  const removeParticipantMutation = useRemoveDealParticipant();
  const createLeadMutation = useCreateLead();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [participantMode, setParticipantMode] = useState<"select" | "create">("select");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [participantRole, setParticipantRole] = useState("participant");
  
  // Estados para criar novo lead
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadCompany, setNewLeadCompany] = useState("");
  const [newLeadPosition, setNewLeadPosition] = useState("");
  
  const [newNote, setNewNote] = useState("");
  const [isLostDialogOpen, setIsLostDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: deal?.currency || "BRL",
    }).format(value);
  };

  // Cor da probabilidade
  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return "text-green-600";
    if (probability >= 50) return "text-yellow-600";
    if (probability >= 25) return "text-orange-600";
    return "text-red-600";
  };

  // Badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ganho
          </Badge>
        );
      case "lost":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Perdido
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Em aberto
          </Badge>
        );
    }
  };

  // Atualizar título
  const handleUpdateTitle = async () => {
    if (!editedTitle.trim() || !id) return;

    await updateDealMutation.mutateAsync({
      id,
      updates: { title: editedTitle },
    });

    setIsEditingTitle(false);
  };

  // Adicionar participante
  const handleAddParticipant = async () => {
    if (!id || !user?.id) return;

    try {
      let leadId = selectedLeadId;

      // Modo: Criar novo lead
      if (participantMode === "create") {
        // Validação
        if (!newLeadName && !newLeadEmail) {
          toast.error("Preencha pelo menos o nome ou email do lead");
          return;
        }

        // Separar nome em first_name e last_name
        const nameParts = (newLeadName || newLeadEmail || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Criar o lead primeiro - usar estrutura do banco
        const leadData: any = {
          first_name: firstName,
          last_name: lastName || firstName, // Se não tiver sobrenome, duplica o primeiro
          name: newLeadName || newLeadEmail, // Campo computado para compatibilidade
          full_name: newLeadName || newLeadEmail,
          email: newLeadEmail || null,
          phone: newLeadPhone || null,
          company: newLeadCompany || null,
          title: newLeadPosition || null, // cargo/função (coluna correta)
          job_title: newLeadPosition || null, // compatibilidade
          status: "lead",
          source: "manual",
          user_id: user.id,
        };

        const { data: newLead, error } = await supabase
          .from('leads')
          .insert(leadData)
          .select()
          .single();

        if (error) throw error;
        
        const displayName = newLead.name || newLead.email || "Novo Lead";
        leadId = newLead.id;
        toast.success(`Lead "${displayName}" criado com sucesso!`);
      }

      // Modo: Selecionar existente
      if (participantMode === "select" && !selectedLeadId) {
        toast.error("Selecione um lead");
        return;
      }

      // Adicionar como participante
      await addParticipantMutation.mutateAsync({
        dealId: id,
        leadId: leadId,
        userId: user.id,
        role: participantRole,
        isPrimary: participants.length === 0, // Primeiro é primário
      });

      toast.success("Participante adicionado!");
      
      // Reset form
      setIsAddParticipantOpen(false);
      setSelectedLeadId("");
      setParticipantRole("participant");
      setParticipantMode("select");
      setNewLeadName("");
      setNewLeadEmail("");
      setNewLeadPhone("");
      setNewLeadCompany("");
      setNewLeadPosition("");
      
      // Refresh participants
      refetchParticipants();
    } catch (error: any) {
      console.error("Erro ao adicionar participante:", error);
      toast.error(error.message || "Erro ao adicionar participante");
    }
  };

  // Remover participante
  const handleRemoveParticipant = async (participantId: string) => {
    if (!id) return;

    await removeParticipantMutation.mutateAsync({
      participantId,
      dealId: id,
    });
  };

  // Marcar participante como principal
  const handleSetPrimary = async (participantId: string) => {
    toast.info("Marcar como principal - em desenvolvimento");
    // TODO: Implementar mutation para atualizar is_primary
  };

  // Marcar como ganho
  const handleMarkAsWon = async () => {
    if (!id) return;
    await markAsWonMutation.mutateAsync({ dealId: id });
  };

  // Marcar como perdido
  const handleMarkAsLost = async () => {
    if (!id) return;
    
    if (!lostReason || lostReason.trim() === '') {
      toast.error("É necessário informar o motivo da perda");
      return;
    }
    
    await markAsLostMutation.mutateAsync({ 
      dealId: id,
      lostReason: lostReason.trim()
    });
    
    setIsLostDialogOpen(false);
    setLostReason("");
  };

  // Obter iniciais
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Traduzir role
  const translateRole = (role: string) => {
    const roles: Record<string, string> = {
      decision_maker: "Decisor",
      influencer: "Influenciador",
      user: "Usuário",
      technical: "Técnico",
      champion: "Defensor",
      participant: "Participante",
    };
    return roles[role] || role;
  };

  if (dealLoading || participantsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Negócio não encontrado</h2>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <PageHeader
            title={deal?.title || "Detalhes do Negócio"}
            description={deal?.value ? `Valor: ${formatCurrency(deal.value)} • Probabilidade: ${deal.probability}%` : "Gerencie as informações do negócio"}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/deals")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                
                {/* Botão de Enviar Email */}
                {deal.status === "open" && primaryParticipant?.lead?.email && (
                  <EmailComposer
                    dealId={deal.id}
                    leadId={primaryParticipant.lead_id}
                    companyId={deal.company_id}
                    defaultTo={primaryParticipant.lead.email}
                    defaultSubject={`Re: ${deal.title}`}
                  />
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {deal.status === "open" && (
                      <>
                        <DropdownMenuItem onClick={handleMarkAsWon}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como Ganho
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsLostDialogOpen(true)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Marcar como Perdido
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => toast.info("Editar - em desenvolvimento")}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Negócio
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 space-y-6">
            {/* Deal Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleUpdateTitle}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateTitle();
                          if (e.key === "Escape") setIsEditingTitle(false);
                        }}
                        autoFocus
                        className="text-2xl font-bold"
                      />
                    </div>
                  ) : (
                    <h1
                      className="text-3xl font-bold cursor-pointer hover:text-primary"
                      onClick={() => {
                        setEditedTitle(deal.title);
                        setIsEditingTitle(true);
                      }}
                    >
                      {deal.title}
                    </h1>
                  )}
                  {deal.description && (
                    <p className="text-muted-foreground mt-2">{deal.description}</p>
                  )}
                </div>
                {getStatusBadge(deal.status)}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Valor</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{formatCurrency(deal.value)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Probabilidade</span>
                    </div>
                    <div className={`text-2xl font-bold mt-2 ${getProbabilityColor(deal.probability)}`}>
                      {deal.probability}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Previsão</span>
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      {deal.expected_close_date
                        ? format(new Date(deal.expected_close_date), "dd 'de' MMM", { locale: ptBR })
                        : "Não definida"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lead Principal & Company Details - Duas Colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Coluna Esquerda - Lead Principal */}
                <LeadDetails 
                  lead={primaryParticipant?.lead || null}
                  role={primaryParticipant?.role}
                  onLeadUpdate={refetchParticipants}
                />

                {/* Coluna Direita - Empresa */}
                <CompanyDetails
                  company={deal.companies}
                  companyId={deal.company_id}
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="participants" className="space-y-4">
              <TabsList>
                <TabsTrigger value="participants">
                  <Users className="h-4 w-4 mr-2" />
                  Participantes ({participants.length})
                </TabsTrigger>
                <TabsTrigger value="activities">
                  <Clock className="h-4 w-4 mr-2" />
                  Atividades
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="h-4 w-4 mr-2" />
                  Notas
                </TabsTrigger>
              </TabsList>

              {/* Email Integration - Sempre visível acima das tabs */}
              <EmailIntegrationCard 
                dealId={id!}
                participantEmails={participants
                  .filter((p: any) => p.lead?.email)
                  .map((p: any) => p.lead.email)
                }
                dealTitle={deal.title}
              />

              {/* Participantes */}
              <TabsContent value="participants" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Pessoas Envolvidas</CardTitle>
                        <CardDescription>
                          Leads participando deste negócio
                        </CardDescription>
                      </div>
                      <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Adicionar Participante</DialogTitle>
                            <DialogDescription>
                              Selecione um lead existente ou crie um novo
                            </DialogDescription>
                          </DialogHeader>

                          {/* Tabs: Selecionar ou Criar */}
                          <Tabs value={participantMode} onValueChange={(v) => setParticipantMode(v as "select" | "create")}>
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="select">Selecionar Existente</TabsTrigger>
                              <TabsTrigger value="create">+ Criar Novo</TabsTrigger>
                            </TabsList>

                            {/* Tab: Selecionar Lead Existente */}
                            <TabsContent value="select" className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Lead</label>
                                <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um lead..." />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[300px]">
                                    {allLeads.length === 0 && (
                                      <div className="p-4 text-center text-sm text-muted-foreground">
                                        Nenhum lead disponível. Crie um novo ao lado →
                                      </div>
                                    )}
                                    {allLeads
                                      .filter((lead) => !participants.some((p: any) => p.lead_id === lead.id))
                                      .map((lead) => {
                                        // Tentar múltiplas fontes para o nome
                                        const fullName = lead.name || 
                                                        (lead.first_name && lead.last_name 
                                                          ? `${lead.first_name} ${lead.last_name}` 
                                                          : lead.first_name || lead.last_name) ||
                                                        lead.full_name;
                                        
                                        const displayName = fullName || lead.email || "Lead sem nome";
                                        
                                        // Informações secundárias
                                        const jobInfo = lead.title || lead.job_title || lead.position || lead.headline;
                                        const companyInfo = lead.companies?.name || lead.company;
                                        
                                        const secondaryInfo = [
                                          companyInfo,
                                          jobInfo,
                                          fullName ? lead.email : null
                                        ].filter(Boolean).join(" • ");
                                        
                                        return (
                                          <SelectItem key={lead.id} value={lead.id}>
                                            <div className="flex flex-col py-1">
                                              <span className="font-medium text-sm">{displayName}</span>
                                              {secondaryInfo && (
                                                <span className="text-xs text-muted-foreground">{secondaryInfo}</span>
                                              )}
                                            </div>
                                          </SelectItem>
                                        );
                                      })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TabsContent>

                            {/* Tab: Criar Novo Lead */}
                            <TabsContent value="create" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Nome *</label>
                                  <Input
                                    placeholder="Ex: João Silva"
                                    value={newLeadName}
                                    onChange={(e) => setNewLeadName(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <Input
                                    type="email"
                                    placeholder="joao@empresa.com"
                                    value={newLeadEmail}
                                    onChange={(e) => setNewLeadEmail(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Telefone</label>
                                  <Input
                                    placeholder="(11) 99999-9999"
                                    value={newLeadPhone}
                                    onChange={(e) => setNewLeadPhone(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Empresa</label>
                                  <Input
                                    placeholder="Empresa XYZ"
                                    value={newLeadCompany}
                                    onChange={(e) => setNewLeadCompany(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Cargo</label>
                                  <Input
                                    placeholder="CEO, Gerente, etc."
                                    value={newLeadPosition}
                                    onChange={(e) => setNewLeadPosition(e.target.value)}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                * Preencha pelo menos o nome ou email
                              </p>
                            </TabsContent>
                          </Tabs>

                          {/* Papel do Participante (comum para ambos os modos) */}
                          <div>
                            <label className="text-sm font-medium">Papel no Negócio</label>
                            <Select value={participantRole} onValueChange={setParticipantRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="decision_maker">Decisor</SelectItem>
                                <SelectItem value="influencer">Influenciador</SelectItem>
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="technical">Técnico</SelectItem>
                                <SelectItem value="champion">Defensor</SelectItem>
                                <SelectItem value="participant">Participante</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Botões */}
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddParticipantOpen(false);
                                setParticipantMode("select");
                                setSelectedLeadId("");
                                setNewLeadName("");
                                setNewLeadEmail("");
                                setNewLeadPhone("");
                                setNewLeadCompany("");
                                setNewLeadPosition("");
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleAddParticipant}
                              disabled={addParticipantMutation.isPending || createLeadMutation.isPending}
                            >
                              {addParticipantMutation.isPending || createLeadMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {participantMode === "create" ? "Criando..." : "Adicionando..."}
                                </>
                              ) : (
                                "Adicionar"
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {participants.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum participante ainda. Adicione pessoas ao negócio.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {participants.map((participant: any) => (
                          <ParticipantCard
                            key={participant.id}
                            participant={participant}
                            onRemove={handleRemoveParticipant}
                            onSetPrimary={handleSetPrimary}
                            onChangeRole={() => {
                              // Refetch participants após edição
                              refetchParticipants();
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Atividades */}
              <TabsContent value="activities">
                <ActivityTimeline dealId={id!} />
              </TabsContent>

              {/* Notas */}
              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>Notas</CardTitle>
                    <CardDescription>
                      Observações e anotações sobre o negócio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Textarea
                        placeholder="Adicione uma nota..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={4}
                      />
                      <Button className="mt-2" disabled={!newNote.trim()}>
                        Adicionar Nota
                      </Button>
                    </div>
                    <Separator />
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma nota ainda
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Dialog: Marcar como Perdido com Justificativa */}
      <Dialog open={isLostDialogOpen} onOpenChange={setIsLostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Oportunidade como Perdida</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da perda. Esta informação é importante para análise e melhoria dos processos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da Perda *</label>
              <Textarea
                placeholder="Ex: Preço muito alto, escolheu concorrente, timing não adequado, etc..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {lostReason.trim() && (
                <p className="text-xs text-green-600">✓ Motivo informado</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsLostDialogOpen(false);
                setLostReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleMarkAsLost}
              disabled={!lostReason.trim() || markAsLostMutation.isPending}
            >
              {markAsLostMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marcando...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Marcar como Perdido
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
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
import {
  useDeal,
  useUpdateDeal,
  useMarkDealAsWon,
  useMarkDealAsLost,
  Deal,
} from "@/hooks/useDeals";
import { useDealParticipants, useAddDealParticipant, useRemoveDealParticipant } from "@/hooks/useDeals";
import { useLeads } from "@/hooks/useLeads";

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: deal, isLoading: dealLoading } = useDeal(id);
  const { data: participants = [], isLoading: participantsLoading } = useDealParticipants(id);
  const { data: allLeads = [] } = useLeads(user?.id);

  const updateDealMutation = useUpdateDeal();
  const markAsWonMutation = useMarkDealAsWon();
  const markAsLostMutation = useMarkDealAsLost();
  const addParticipantMutation = useAddDealParticipant();
  const removeParticipantMutation = useRemoveDealParticipant();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [participantRole, setParticipantRole] = useState("participant");
  const [newNote, setNewNote] = useState("");

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
    if (!selectedLeadId || !id || !user?.id) {
      toast.error("Selecione um lead");
      return;
    }

    await addParticipantMutation.mutateAsync({
      dealId: id,
      leadId: selectedLeadId,
      userId: user.id,
      role: participantRole,
      isPrimary: participants.length === 0, // Primeiro é primário
    });

    setIsAddParticipantOpen(false);
    setSelectedLeadId("");
    setParticipantRole("participant");
  };

  // Remover participante
  const handleRemoveParticipant = async (participantId: string) => {
    if (!id) return;

    await removeParticipantMutation.mutateAsync({
      participantId,
      dealId: id,
    });
  };

  // Marcar como ganho
  const handleMarkAsWon = async () => {
    if (!id) return;
    await markAsWonMutation.mutateAsync({ dealId: id });
  };

  // Marcar como perdido
  const handleMarkAsLost = async () => {
    if (!id) return;
    await markAsLostMutation.mutateAsync({ dealId: id });
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
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1" />
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {deal.status === "open" && (
                  <>
                    <DropdownMenuItem onClick={handleMarkAsWon} className="text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Ganho
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMarkAsLost} className="text-red-600">
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
          </header>

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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Empresa</span>
                    </div>
                    <div className="text-lg font-semibold mt-2 truncate">
                      {deal.company_name || "Não informado"}
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
                        ? format(new Date(deal.expected_close_date), "dd MMM yyyy", { locale: ptBR })
                        : "Não definida"}
                    </div>
                  </CardContent>
                </Card>
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
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Participante</DialogTitle>
                            <DialogDescription>
                              Adicione uma pessoa ao negócio
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <label className="text-sm font-medium">Lead</label>
                              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um lead" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allLeads
                                    .filter(
                                      (lead) =>
                                        !participants.some((p: any) => p.lead_id === lead.id)
                                    )
                                    .map((lead) => (
                                      <SelectItem key={lead.id} value={lead.id}>
                                        {lead.name} - {lead.company || "Sem empresa"}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Papel</label>
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
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsAddParticipantOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={handleAddParticipant}>Adicionar</Button>
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
                      <div className="space-y-3">
                        {participants.map((participant: any) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {participant.lead?.name
                                    ? getInitials(participant.lead.name)
                                    : "??"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {participant.lead?.name || "Nome não disponível"}
                                  {participant.is_primary && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      Principal
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {translateRole(participant.role)}
                                  {participant.lead?.position && ` • ${participant.lead.position}`}
                                  {participant.lead?.company && ` @ ${participant.lead.company}`}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveParticipant(participant.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Atividades */}
              <TabsContent value="activities">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline de Atividades</CardTitle>
                    <CardDescription>
                      Histórico de interações com este negócio
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Sistema de atividades em desenvolvimento
                    </div>
                  </CardContent>
                </Card>
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
    </SidebarProvider>
  );
}

import { Lead } from "@/hooks/useLeads";
import { useMarkLeadAsWon, useMarkLeadAsLost } from "@/hooks/useLeadHistory";
import { useEnrichLead } from "@/hooks/useEnrichLead";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Star,
  RotateCcw,
  Loader2,
  Flame,
  Snowflake,
  Wind,
  Clock,
  Sparkles,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const navigate = useNavigate();
  const [showWonDialog, setShowWonDialog] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [dealValue, setDealValue] = useState("");
  const [lostReason, setLostReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isPriority, setIsPriority] = useState(false);

  const markAsWonMutation = useMarkLeadAsWon();
  const markAsLostMutation = useMarkLeadAsLost();
  const enrichLeadMutation = useEnrichLead();

  // Calculate lead temperature based on last update
  const getLeadTemperature = () => {
    const updatedAt = new Date(lead.updated_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 2) return { label: 'Quente', color: 'text-red-600', bg: 'bg-red-50', icon: Flame };
    if (daysDiff <= 7) return { label: 'Morno', color: 'text-orange-600', bg: 'bg-orange-50', icon: Wind };
    return { label: 'Frio', color: 'text-blue-600', bg: 'bg-blue-50', icon: Snowflake };
  };

  const temperature = getLeadTemperature();
  const TemperatureIcon = temperature.icon;

  // Get initials for avatar
  const getInitials = () => {
    const firstInitial = lead.first_name?.charAt(0) || '';
    const lastInitial = lead.last_name?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Calculate days since last update
  const getDaysSinceUpdate = () => {
    const updatedAt = new Date(lead.updated_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Hoje';
    if (daysDiff === 1) return 'Ontem';
    if (daysDiff < 7) return `${daysDiff}d atrás`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)}sem atrás`;
    return `${Math.floor(daysDiff / 30)}m atrás`;
  };

  const handleMarkAsWon = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWonDialog(true);
  };

  const handleMarkAsLost = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLostDialog(true);
  };

  const handleScheduleMeeting = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Funcionalidade de agendamento em breve!");
  };

  const handleSendMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Funcionalidade de mensagem em breve!");
  };

  const handleMarkAsHot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPriority(!isPriority);
    toast.success(isPriority ? "Lead removido das prioridades" : "Lead marcado como prioritário!");
  };

  const handleFollowUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Follow-up agendado!");
  };

  const handleEnrichLead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Verifica se tem dados suficientes
    const hasName = !!(lead.first_name && lead.last_name);
    const hasCompany = !!lead.company;
    const hasEmail = !!lead.email;
    const hasLinkedIn = !!lead.linkedin_url;

    let canEnrich = false;
    let message = "";

    if (hasLinkedIn) {
      canEnrich = true;
      message = `🚀 Enriquecendo via LinkedIn - a melhor fonte de dados!`;
    } else if (hasEmail) {
      canEnrich = true;
      message = `📧 Enriquecendo via Email - buscando dados completos...`;
    } else if (hasName && hasCompany) {
      canEnrich = true;
      message = `🔍 Buscando email profissional de ${lead.first_name} na ${lead.company}...`;
    } else {
      // Dados insuficientes
      const missing = [];
      if (!hasName) missing.push("Nome Completo");
      if (!hasCompany && !hasEmail && !hasLinkedIn) missing.push("Empresa/Email/LinkedIn");
      
      toast.error("Dados Insuficientes", {
        description: `Para enriquecer, adicione: ${missing.join(" + ")}. Clique no card e depois em Editar.`,
      });
      return;
    }

    toast.info(message);
    
    // Extrai domínio do email se disponível
    const extractDomain = (email: string): string | undefined => {
      const match = email.match(/@([^@]+)$/);
      return match ? match[1] : undefined;
    };
    
    const companyDomain = lead.email 
      ? extractDomain(lead.email)
      : undefined;
    
    await enrichLeadMutation.mutateAsync({
      leadId: lead.id,
      leadData: {
        first_name: lead.first_name || undefined,
        last_name: lead.last_name || undefined,
        email: lead.email || undefined,
        company: lead.company || undefined,
        company_domain: companyDomain,
        linkedin_url: lead.linkedin_url || undefined,
      },
      options: {
        findEmail: !lead.email, // Só busca email se não tiver
        verifyEmail: !!lead.email, // Só verifica se já tiver email
        enrichCompany: !!companyDomain,
        enrichPerson: !!(lead.email || lead.linkedin_url), // Enriquece se tiver email OU LinkedIn
      },
    });
  };

  const confirmWon = async () => {
    const value = parseFloat(dealValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    await markAsWonMutation.mutateAsync({
      leadId: lead.id,
      dealValue: value,
      notes: notes.trim() || undefined
    });

    setShowWonDialog(false);
    setDealValue("");
    setNotes("");
  };

  const confirmLost = async () => {
    if (!lostReason.trim()) {
      toast.error("Por favor, informe o motivo da perda");
      return;
    }

    await markAsLostMutation.mutateAsync({
      leadId: lead.id,
      lostReason: lostReason.trim(),
      notes: notes.trim() || undefined
    });

    setShowLostDialog(false);
    setLostReason("");
    setNotes("");
  };

  return (
    <>
      <Card
        className="group p-3 mb-3 cursor-pointer hover:shadow-sm transition-all duration-200 bg-background/80 backdrop-blur-sm border-border/50 hover:border-border/80 hover:bg-background/90 relative"
        onClick={() => onClick(lead)}
      >
        {/* Estrela de prioridade - sempre visível com estados diferentes */}
        <div className="absolute top-1.5 left-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0 hover:bg-yellow-100 transition-colors rounded-sm"
            onClick={handleMarkAsHot}
            title={isPriority ? "Remover das prioridades" : "Marcar como prioritário"}
          >
            <Star 
              className={`h-3.5 w-3.5 transition-all duration-200 ${
                isPriority 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-muted-foreground/30 hover:text-yellow-400 hover:text-opacity-70'
              }`} 
            />
          </Button>
        </div>

        {/* Ações rápidas - aparecem no hover */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-purple-100 hover:text-purple-700"
            onClick={handleEnrichLead}
            disabled={enrichLeadMutation.isPending}
            title="Enriquecer Lead com IA"
          >
            {enrichLeadMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
            onClick={handleMarkAsWon}
            title="Marcar como Ganho"
          >
            <CheckCircle2 className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
            onClick={handleMarkAsLost}
            title="Marcar como Perdido"
          >
            <XCircle className="h-3 w-3" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Ações do Lead</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/leads/${lead.id}`);
                }}
                className="font-medium"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos os Dados
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleEnrichLead}
                disabled={enrichLeadMutation.isPending}
                className="text-purple-700 font-medium"
              >
                {enrichLeadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Enriquecer Lead com IA
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleScheduleMeeting}>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Reunião
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleSendMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleMarkAsHot}>
                <Star className={`h-4 w-4 mr-2 transition-all duration-200 ${
                  isPriority 
                    ? 'text-yellow-500 fill-yellow-500' 
                    : 'text-muted-foreground'
                }`} />
                {isPriority ? 'Remover Prioridade' : 'Marcar como Prioritário'}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleFollowUp}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Agendar Follow-up
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleMarkAsWon} className="text-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Ganho
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleMarkAsLost} className="text-red-700">
                <XCircle className="h-4 w-4 mr-2" />
                Marcar como Perdido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Conteúdo principal - sempre com espaço para estrela e ações */}
        <div className="space-y-2 pl-6 pr-14 pt-1">
          {/* Avatar e Nome */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              {/* Nome completo - destaque principal */}
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {lead.first_name} {lead.last_name}
              </h3>
              
              {/* Cargo - informação secundária importante */}
              {lead.job_title && (
                <p className="text-xs text-muted-foreground font-medium leading-tight mt-0.5">
                  {lead.job_title}
                </p>
              )}
            </div>
          </div>
          
          {/* Empresa - contexto importante */}
          {lead.company && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 opacity-70 flex-shrink-0" />
              <span className="truncate font-medium">{lead.company}</span>
            </div>
          )}
          
          {/* Temperature and Last Update */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${temperature.bg}`}>
              <TemperatureIcon className={`h-3 w-3 ${temperature.color}`} />
              <span className={`text-xs font-medium ${temperature.color}`}>{temperature.label}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{getDaysSinceUpdate()}</span>
            </div>
          </div>
          
          {/* Contato - apenas se for a única informação disponível */}
          {!lead.company && !lead.job_title && lead.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 opacity-70 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog para Marcar como Ganho */}
      <Dialog open={showWonDialog} onOpenChange={setShowWonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Marcar Lead como GANHO
            </DialogTitle>
            <DialogDescription>
              Parabéns! Este lead foi convertido em cliente. Registre os detalhes da venda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dealValue">Valor do Negócio (R$)</Label>
              <Input
                id="dealValue"
                type="number"
                placeholder="0,00"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes sobre a venda, condições, etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWonDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmWon}
              className="bg-green-600 hover:bg-green-700"
              disabled={!dealValue || markAsWonMutation.isPending}
            >
              {markAsWonMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Ganho"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Marcar como Perdido */}
      <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Marcar Lead como PERDIDO
            </DialogTitle>
            <DialogDescription>
              Este lead não se converteu. Registre o motivo para análises futuras.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lostReason">Motivo da Perda</Label>
              <Input
                id="lostReason"
                placeholder="Ex: Preço muito alto, escolheu concorrente..."
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lostNotes">Observações (opcional)</Label>
              <Textarea
                id="lostNotes"
                placeholder="Detalhes adicionais sobre o motivo da perda..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLostDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmLost}
              disabled={!lostReason || markAsLostMutation.isPending}
            >
              {markAsLostMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Perda"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

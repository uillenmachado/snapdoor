import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Building2, Mail, Phone, Linkedin, MessageSquare, Send, Calendar, Phone as PhoneIcon, Loader2, Sparkles, Edit, AlertCircle } from "lucide-react";
import { Lead } from "@/hooks/useLeads";
import { useNotes, useCreateNote } from "@/hooks/useNotes";
import { useActivities, useCreateActivity } from "@/hooks/useActivities";
import { useEnrichLead } from "@/hooks/useEnrichLead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface LeadDetailsProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
}

export function LeadDetails({ lead, isOpen, onClose, userId }: LeadDetailsProps) {
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    job_title: "",
    company: "",
    email: "",
    phone: "",
    linkedin_url: "",
  });

  const queryClient = useQueryClient();

  // Fetch notes and activities
  const { data: notes = [], isLoading: notesLoading } = useNotes(lead?.id);
  const { data: activities = [], isLoading: activitiesLoading } = useActivities(lead?.id);

  // Mutations
  const createNoteMutation = useCreateNote();
  const createActivityMutation = useCreateActivity();
  const enrichLeadMutation = useEnrichLead();

  if (!lead) return null;

  // Preenche formulário ao abrir edição
  const openEditDialog = () => {
    setEditForm({
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      job_title: lead.job_title || "",
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      linkedin_url: lead.linkedin_url || "",
    });
    setShowEditDialog(true);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !userId) return;

    await createNoteMutation.mutateAsync({
      lead_id: lead.id,
      user_id: userId,
      content: newNote,
    });

    setNewNote("");
  };

  const handleActivity = async (type: "message" | "email" | "call" | "meeting" | "comment", description: string) => {
    if (!userId) return;

    await createActivityMutation.mutateAsync({
      lead_id: lead.id,
      user_id: userId,
      type,
      description,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          ...editForm,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lead.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead atualizado com sucesso!");
      setShowEditDialog(false);
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      toast.error("Erro ao atualizar lead");
    }
  };

  // Verifica o que é possível enriquecer
  const getEnrichmentStatus = () => {
    const hasName = !!(lead.first_name && lead.last_name);
    const hasCompany = !!lead.company;
    const hasEmail = !!lead.email;
    const hasLinkedIn = !!lead.linkedin_url;

    // Cenário 1: Nome + Empresa (pode buscar email)
    if (hasName && hasCompany && !hasEmail && !hasLinkedIn) {
      return {
        canEnrich: true,
        method: "name_company",
        title: "✅ Pronto para buscar Email!",
        description: `Temos Nome Completo + Empresa. Vamos buscar o email profissional de ${lead.first_name}.`,
        credits: 3,
      };
    }

    // Cenário 2: Email (pode enriquecer tudo)
    if (hasEmail) {
      return {
        canEnrich: true,
        method: "email",
        title: "✅ Pronto para Enriquecer!",
        description: "Com o email, vamos descobrir cargo, empresa, telefone e redes sociais.",
        credits: hasCompany ? 7 : 5,
      };
    }

    // Cenário 3: LinkedIn (melhor opção)
    if (hasLinkedIn) {
      return {
        canEnrich: true,
        method: "linkedin",
        title: "✅ LinkedIn Detectado - Melhor Opção!",
        description: "Com LinkedIn, vamos descobrir dados completos e atualizados do perfil.",
        credits: 2,
      };
    }

    // Cenário 4: Dados insuficientes
    const missing = [];
    if (!hasName) missing.push("Nome Completo");
    if (!hasCompany && !hasEmail && !hasLinkedIn) missing.push("Empresa OU Email OU LinkedIn");

    return {
      canEnrich: false,
      method: "insufficient",
      title: "❌ Dados Insuficientes",
      description: `Faltam: ${missing.join(" e ")}`,
      suggestions: [
        { icon: "✏️", text: "Clique em 'Editar' e adicione Nome + Empresa", priority: !hasName || !hasCompany },
        { icon: "📧", text: "OU adicione o Email profissional", priority: !hasEmail },
        { icon: "💼", text: "OU adicione o LinkedIn (melhor opção!)", priority: !hasLinkedIn },
      ],
      credits: 0,
    };
  };

  const handleEnrichLead = async () => {
    const status = getEnrichmentStatus();
    
    if (!status.canEnrich) {
      toast.error(status.title, {
        description: status.description,
      });
      return;
    }

    // Extrai domínio do email
    const extractDomain = (email: string): string | undefined => {
      const match = email.match(/@([^@]+)$/);
      return match ? match[1] : undefined;
    };

    const companyDomain = lead.email ? extractDomain(lead.email) : undefined;

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
        findEmail: !lead.email,
        verifyEmail: !!lead.email,
        enrichCompany: !!companyDomain,
        enrichPerson: !!(lead.email || lead.linkedin_url), // Enriquece se tiver email OU LinkedIn
      },
    });
  };

  const handleWhatsApp = () => {
    if (!lead.phone) {
      toast.error("Telefone não disponível");
      return;
    }
    
    // Remove caracteres não numéricos
    const cleanPhone = lead.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${lead.first_name}, tudo bem? Sou da ${lead.company || "nossa empresa"} e gostaria de conversar com você.`
    );
    
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    handleActivity("message", "Enviou mensagem via WhatsApp");
  };

  const handleEmail = () => {
    if (!lead.email) {
      toast.error("Email não disponível");
      return;
    }
    
    const subject = encodeURIComponent(`Contato - ${lead.company || "Oportunidade"}`);
    const body = encodeURIComponent(
      `Olá ${lead.first_name},\n\nEspero que esteja bem!\n\n`
    );
    
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, "_blank");
    handleActivity("email", `Enviou email para ${lead.email}`);
  };

  // Verifica campos vazios
  const missingFields = [
    !lead.email && "Email",
    !lead.phone && "Telefone",
    !lead.job_title && "Cargo",
    !lead.company && "Empresa",
    !lead.linkedin_url && "LinkedIn",
  ].filter(Boolean);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl flex items-center justify-between">
            <span>
              {lead.first_name} {lead.last_name}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={openEditDialog}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </SheetTitle>
          <SheetDescription>{lead.job_title || "Cargo não informado"}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Missing Info Card */}
          {missingFields.length > 0 && (() => {
            const enrichStatus = getEnrichmentStatus();
            const cardColor = enrichStatus.canEnrich ? "green" : "orange";
            
            return (
              <Card className={`border-${cardColor}-200 bg-${cardColor}-50`}>
                <CardHeader>
                  <CardTitle className={`text-base flex items-center gap-2 text-${cardColor}-800`}>
                    <AlertCircle className="h-4 w-4" />
                    {enrichStatus.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Campos faltando */}
                  <div className="flex flex-wrap gap-2">
                    {missingFields.map((field) => (
                      <Badge key={field} variant="outline" className={`text-${cardColor}-700 border-${cardColor}-300`}>
                        {field}
                      </Badge>
                    ))}
                  </div>

                  {/* Descrição do status */}
                  <div className={`text-sm p-3 rounded-md ${enrichStatus.canEnrich ? 'bg-green-100 text-green-900' : 'bg-orange-100 text-orange-900'}`}>
                    <p className="font-medium">{enrichStatus.description}</p>
                    {enrichStatus.canEnrich && (
                      <p className="text-xs mt-1 opacity-80">
                        💎 Custo estimado: {enrichStatus.credits} créditos
                      </p>
                    )}
                  </div>

                  {/* Sugestões (se dados insuficientes) */}
                  {!enrichStatus.canEnrich && enrichStatus.suggestions && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs font-semibold text-orange-900 uppercase">
                        Como obter dados:
                      </p>
                      {enrichStatus.suggestions
                        .sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0))
                        .map((suggestion, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                            <span className="text-base">{suggestion.icon}</span>
                            <span>{suggestion.text}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Botão de enriquecimento */}
                  <Button
                    onClick={handleEnrichLead}
                    disabled={enrichLeadMutation.isPending || !enrichStatus.canEnrich}
                    className={`w-full ${enrichStatus.canEnrich ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400'}`}
                  >
                    {enrichLeadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enriquecendo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {enrichStatus.canEnrich ? 'Enriquecer Lead com IA' : 'Adicione Mais Dados Primeiro'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })()}

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.company}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.linkedin_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={lead.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ver perfil no LinkedIn
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleWhatsApp}
                disabled={!lead.phone}
                className="bg-green-50 hover:bg-green-100 border-green-200"
              >
                <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEmail}
                disabled={!lead.email}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Send className="h-4 w-4 mr-2 text-blue-600" />
                Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleActivity("call", "Ligação realizada")
                }
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Ligação
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleActivity("meeting", "Reunião agendada")
                }
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reunião
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (lead.linkedin_url) {
                    window.open(lead.linkedin_url, "_blank");
                    handleActivity("message", "Enviou mensagem no LinkedIn");
                  } else {
                    toast.error("LinkedIn não disponível");
                  }
                }}
                disabled={!lead.linkedin_url}
                className="col-span-2"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">
                Notas ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex-1">
                Atividades ({activities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Criado em: </span>
                    <span>{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Última atualização: </span>
                    <span>{new Date(lead.updated_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total de notas: </span>
                    <span>{notes.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total de atividades: </span>
                    <span>{activities.length}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Adicionar uma nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleAddNote} 
                  className="w-full"
                  disabled={createNoteMutation.isPending || !newNote.trim()}
                >
                  {createNoteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar Nota"
                  )}
                </Button>
              </div>

              {notesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhuma nota ainda. Adicione a primeira!
                    </p>
                  ) : (
                    notes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="pt-4">
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleString("pt-BR")}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activities" className="space-y-3">
              {activitiesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma atividade registrada ainda.
                </p>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent rounded-lg">
                          {activity.type === "message" && <MessageSquare className="h-4 w-4 text-accent-foreground" />}
                          {activity.type === "email" && <Send className="h-4 w-4 text-accent-foreground" />}
                          {activity.type === "call" && <PhoneIcon className="h-4 w-4 text-accent-foreground" />}
                          {activity.type === "meeting" && <Calendar className="h-4 w-4 text-accent-foreground" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">{activity.type}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.created_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Informações do Lead</DialogTitle>
            <DialogDescription>
              Atualize as informações do lead. Deixe campos vazios se não souber.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Primeiro Nome *</Label>
                <Input
                  id="first_name"
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, first_name: e.target.value })
                  }
                  placeholder="João"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Sobrenome *</Label>
                <Input
                  id="last_name"
                  value={editForm.last_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, last_name: e.target.value })
                  }
                  placeholder="Silva"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="job_title">Cargo</Label>
              <Input
                id="job_title"
                value={editForm.job_title}
                onChange={(e) =>
                  setEditForm({ ...editForm, job_title: e.target.value })
                }
                placeholder="Gerente de Vendas"
              />
            </div>

            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={editForm.company}
                onChange={(e) =>
                  setEditForm({ ...editForm, company: e.target.value })
                }
                placeholder="Empresa LTDA"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="joao@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="+55 11 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={editForm.linkedin_url}
                onChange={(e) =>
                  setEditForm({ ...editForm, linkedin_url: e.target.value })
                }
                placeholder="https://linkedin.com/in/joaosilva"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

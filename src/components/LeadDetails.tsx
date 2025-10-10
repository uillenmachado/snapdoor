import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Building2, Mail, Phone, Linkedin, MessageSquare, Send, Calendar, Phone as PhoneIcon, Loader2 } from "lucide-react";
import { Lead } from "@/hooks/useLeads";
import { useNotes, useCreateNote } from "@/hooks/useNotes";
import { useActivities, useCreateActivity } from "@/hooks/useActivities";

interface LeadDetailsProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
}

export function LeadDetails({ lead, isOpen, onClose, userId }: LeadDetailsProps) {
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch notes and activities
  const { data: notes = [], isLoading: notesLoading } = useNotes(lead?.id);
  const { data: activities = [], isLoading: activitiesLoading } = useActivities(lead?.id);

  // Mutations
  const createNoteMutation = useCreateNote();
  const createActivityMutation = useCreateActivity();

  if (!lead) return null;

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl">
            {lead.first_name} {lead.last_name}
          </SheetTitle>
          <SheetDescription>{lead.job_title}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
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
            <CardContent className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleActivity("message", "Enviou mensagem no LinkedIn")
                }
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensagem LinkedIn
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleActivity("email", `Enviou email para ${lead.email}`)
                }
                disabled={!lead.email}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleActivity("call", "Ligação realizada")
                }
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Registrar Ligação
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleActivity("meeting", "Reunião agendada")
                }
              >
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Reunião
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
    </Sheet>
  );
}

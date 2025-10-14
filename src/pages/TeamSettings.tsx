// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Shield, Mail, Settings, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTeams, useTeam, useCreateTeam, useUpdateTeam } from "@/hooks/useTeam";
import { InviteUser } from "@/components/InviteUser";
import { RoleManager } from "@/components/RoleManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const TeamSettings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const { data: currentTeam } = useTeam(selectedTeamId || undefined);

  // Dialog de criar time
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const createTeamMutation = useCreateTeam();

  // Settings do time
  const [visibilityDefault, setVisibilityDefault] = useState<"own" | "team" | "all">("team");
  const [allowMemberInvite, setAllowMemberInvite] = useState(false);
  const updateTeamMutation = useUpdateTeam();

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Selecionar primeiro time automaticamente
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Sincronizar settings com o time atual
  useEffect(() => {
    if (currentTeam) {
      setVisibilityDefault(currentTeam.visibilityDefault);
      setAllowMemberInvite(currentTeam.allowMemberInvite);
    }
  }, [currentTeam]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTeamName.trim()) {
      toast.error("Nome do time é obrigatório");
      return;
    }

    const result = await createTeamMutation.mutateAsync({
      name: newTeamName,
      description: newTeamDescription,
      visibilityDefault: "team",
      allowMemberInvite: false,
    });

    setNewTeamName("");
    setNewTeamDescription("");
    setCreateDialogOpen(false);
    setSelectedTeamId(result.id);
  };

  const handleUpdateSettings = async () => {
    if (!selectedTeamId) return;

    await updateTeamMutation.mutateAsync({
      teamId: selectedTeamId,
      data: {
        visibilityDefault,
        allowMemberInvite,
      } as any,
    });
  };

  if (authLoading || teamsLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Se não tem times, mostrar tela de criar primeiro time
  if (!teams || teams.length === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <Card className="max-w-md w-full">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <CardTitle>Crie seu Primeiro Time</CardTitle>
                <CardDescription>
                  Organize seu trabalho em times e colabore com sua equipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Nome do Time</Label>
                    <Input
                      id="teamName"
                      placeholder="Ex: Equipe de Vendas"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamDescription">Descrição (opcional)</Label>
                    <Input
                      id="teamDescription"
                      placeholder="Breve descrição do time"
                      value={newTeamDescription}
                      onChange={(e) => setNewTeamDescription(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createTeamMutation.isPending}>
                    {createTeamMutation.isPending ? "Criando..." : "Criar Time"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Gerenciar Equipe
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Gerencie membros, cargos e permissões do time
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Seletor de time */}
                <Select value={selectedTeamId || undefined} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Selecione um time" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Botão de criar time */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Time
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleCreateTeam}>
                      <DialogHeader>
                        <DialogTitle>Criar Novo Time</DialogTitle>
                        <DialogDescription>
                          Crie um novo time para organizar sua equipe
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome do Time</Label>
                          <Input
                            id="name"
                            placeholder="Ex: Equipe de Vendas"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Descrição (opcional)</Label>
                          <Input
                            id="description"
                            placeholder="Breve descrição"
                            value={newTeamDescription}
                            onChange={(e) => setNewTeamDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createTeamMutation.isPending}>
                          {createTeamMutation.isPending ? "Criando..." : "Criar"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {!selectedTeamId ? (
              <div className="text-center py-12 text-muted-foreground">
                Selecione um time para gerenciar
              </div>
            ) : (
              <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="members">
                    <Users className="h-4 w-4 mr-2" />
                    Membros
                  </TabsTrigger>
                  <TabsTrigger value="invitations">
                    <Mail className="h-4 w-4 mr-2" />
                    Convites
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Membros */}
                <TabsContent value="members" className="mt-6 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Membros do Time</CardTitle>
                      <CardDescription>
                        Gerencie os membros, cargos e permissões do time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RoleManager teamId={selectedTeamId} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Convites */}
                <TabsContent value="invitations" className="mt-6">
                  <InviteUser teamId={selectedTeamId} />
                </TabsContent>

                {/* Tab: Configurações */}
                <TabsContent value="settings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configurações do Time</CardTitle>
                      <CardDescription>
                        Configure as preferências e permissões gerais do time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Visibilidade padrão */}
                      <div className="space-y-2">
                        <Label>Visibilidade Padrão de Dados</Label>
                        <Select value={visibilityDefault} onValueChange={(v: any) => setVisibilityDefault(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="own">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">Apenas Próprios</span>
                                <span className="text-xs text-muted-foreground">
                                  Cada membro vê apenas seus próprios dados
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="team">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">Todo o Time</span>
                                <span className="text-xs text-muted-foreground">
                                  Membros veem dados de todos do time
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="all">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">Todos os Dados</span>
                                <span className="text-xs text-muted-foreground">
                                  Acesso a todos os dados do sistema
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Define quem pode visualizar leads, deals e atividades por padrão
                        </p>
                      </div>

                      {/* Permitir membros convidar */}
                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label>Permitir Membros Convidarem</Label>
                          <p className="text-sm text-muted-foreground">
                            Membros comuns podem enviar convites para o time
                          </p>
                        </div>
                        <Switch
                          checked={allowMemberInvite}
                          onCheckedChange={setAllowMemberInvite}
                        />
                      </div>

                      <div className="pt-4">
                        <Button onClick={handleUpdateSettings} disabled={updateTeamMutation.isPending}>
                          {updateTeamMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TeamSettings;

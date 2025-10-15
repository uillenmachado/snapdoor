import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useUploadAvatar, useUpdatePassword } from "@/hooks/useProfile";
import { useSubscription, PLAN_LIMITS } from "@/hooks/useSubscription";

const Settings = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: subscription } = useSubscription(user?.id);
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const updatePasswordMutation = useUpdatePassword();

  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update form when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    await updateProfileMutation.mutateAsync({
      userId: user.id,
      updates: { full_name: fullName },
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    await uploadAvatarMutation.mutateAsync({ userId: user.id, file });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    await updatePasswordMutation.mutateAsync({ newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
                <TabsTrigger value="integration">Integração</TabsTrigger>
                <TabsTrigger value="scraper">Scraper Logs</TabsTrigger>
                <TabsTrigger value="account">Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais e profissionais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="avatar-upload"
                          onChange={handleAvatarChange}
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById("avatar-upload")?.click()}
                          disabled={uploadAvatarMutation.isPending}
                        >
                          {uploadAvatarMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            "Alterar Foto"
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG ou GIF. Máximo 2MB.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="João Silva"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        O email não pode ser alterado
                      </p>
                    </div>

                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Notificação</CardTitle>
                    <CardDescription>
                      Configure como você deseja receber notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email de Novos Leads</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba um email quando um novo lead for adicionado
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Lembretes de Atividades</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba lembretes de atividades agendadas
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios Semanais</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba um resumo semanal das suas atividades
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações no navegador
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Atualizações do Produto</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba novidades sobre recursos e melhorias
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integration" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Integração com LinkedIn</CardTitle>
                    <CardDescription>
                      Configure a extensão do navegador para capturar leads
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <h3 className="font-semibold mb-2 text-primary">
                        Extensão Instalada ✓
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        A extensão Snapdoor está ativa e pronta para capturar
                        leads do LinkedIn.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Como usar a extensão:</h3>
                      <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                        <li>Navegue até o perfil de um lead no LinkedIn</li>
                        <li>
                          Clique no ícone da extensão Snapdoor no navegador
                        </li>
                        <li>
                          Selecione o pipeline de destino e clique em "Adicionar
                          Lead"
                        </li>
                        <li>
                          O lead será automaticamente capturado com nome, cargo e
                          empresa
                        </li>
                      </ol>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Pipeline Padrão</Label>
                      <Input value="Pipeline Principal" disabled />
                      <p className="text-xs text-muted-foreground">
                        Leads capturados serão adicionados automaticamente ao
                        pipeline padrão
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Etapa Inicial Padrão</Label>
                      <Input value="Qualificado" disabled />
                      <p className="text-xs text-muted-foreground">
                        Novos leads serão adicionados nesta etapa por padrão
                      </p>
                    </div>

                    <Button variant="outline">Configurar Extensão</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scraper" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Scraper Logs</CardTitle>
                    <CardDescription>
                      Acompanhe os logs e estatísticas do scraper de dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 rounded-lg bg-muted text-center">
                      <p className="text-sm text-muted-foreground">
                        Os logs do scraper são exibidos aqui para monitoramento de jobs, status e estatísticas.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Acesse a página dedicada para visualização completa:
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => window.location.href = '/scraper-logs'}
                      >
                        Ver Scraper Logs Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Plano Atual</CardTitle>
                      <CardDescription>
                        Gerencie sua assinatura e faturamento
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {subscription && (
                        <div className="p-4 rounded-lg bg-muted">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {subscription.plan !== "free" && <Crown className="h-5 w-5 text-yellow-500" />}
                              <h3 className="font-semibold text-lg">
                                Plano {PLAN_LIMITS[subscription.plan].name}
                              </h3>
                            </div>
                            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                              {subscription.status === "active" ? "Ativo" : subscription.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {subscription.plan === "free" 
                              ? "Plano gratuito" 
                              : `R$ ${PLAN_LIMITS[subscription.plan].price}/mês`}
                            {subscription.current_period_end && (
                              <> • Renovação em {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}</>
                            )}
                          </p>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Recursos incluídos:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {PLAN_LIMITS[subscription.plan].features.slice(0, 3).map((feature, i) => (
                                <li key={i}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                          <Link to="/pricing">
                            <Button variant="outline" className="mt-4 w-full">
                              {subscription.plan === "free" ? "Ver Planos" : "Alterar Plano"}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Segurança</CardTitle>
                      <CardDescription>
                        Altere sua senha e configure autenticação
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Senha Atual</Label>
                        <Input 
                          id="currentPassword" 
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input 
                          id="newPassword" 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirmar Nova Senha
                        </Label>
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleChangePassword}
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Alterando...
                          </>
                        ) : (
                          "Alterar Senha"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-destructive">
                        Zona de Perigo
                      </CardTitle>
                      <CardDescription>
                        Ações irreversíveis na sua conta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="destructive">Excluir Conta</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;

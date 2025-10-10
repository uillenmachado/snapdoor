import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MessageSquare, Calendar, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserActivities, useUpdateActivity } from "@/hooks/useActivities";

const Activities = () => {
  const { user } = useAuth();
  const { data: activitiesData, isLoading } = useUserActivities(user?.id);
  const updateActivityMutation = useUpdateActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      call: "Ligação",
      email: "Email",
      message: "Mensagem",
      meeting: "Reunião",
      comment: "Comentário",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const handleToggleComplete = async (activityId: string, currentCompleted: boolean | null) => {
    await updateActivityMutation.mutateAsync({
      id: activityId,
      updates: { completed: !currentCompleted },
    });
  };

  const activities = activitiesData || [];
  const pendingActivities = activities.filter((a) => !a.completed);
  const completedActivities = activities.filter((a) => a.completed);

  if (isLoading) {
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
                <h1 className="text-2xl font-bold text-foreground">Atividades</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="grid gap-4 mb-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activities.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{pendingActivities.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedActivities.length}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList>
                <TabsTrigger value="pending">
                  Pendentes ({pendingActivities.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Concluídas ({completedActivities.length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  Todas ({activities.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-3">
                  {pendingActivities.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        Nenhuma atividade pendente
                      </CardContent>
                    </Card>
                  ) : (
                    pendingActivities.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">
                                    {getActivityTypeLabel(activity.type)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(activity.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm font-medium mb-1">{activity.description}</p>
                                {activity.leads && (
                                  <p className="text-sm text-muted-foreground">
                                    {(activity.leads as any).first_name} {(activity.leads as any).last_name} • {(activity.leads as any).company}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleComplete(activity.id, activity.completed)}
                              className="shrink-0"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Marcar como concluída
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="space-y-3">
                  {completedActivities.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        Nenhuma atividade concluída
                      </CardContent>
                    </Card>
                  ) : (
                    completedActivities.map((activity) => (
                      <Card key={activity.id} className="opacity-75">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-green-100 rounded-lg mt-1">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">
                                    {getActivityTypeLabel(activity.type)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(activity.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm font-medium mb-1 line-through">{activity.description}</p>
                                {activity.leads && (
                                  <p className="text-sm text-muted-foreground">
                                    {(activity.leads as any).first_name} {(activity.leads as any).last_name} • {(activity.leads as any).company}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleComplete(activity.id, activity.completed)}
                              className="shrink-0"
                            >
                              Reabrir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        Nenhuma atividade registrada
                      </CardContent>
                    </Card>
                  ) : (
                    activities.map((activity) => (
                      <Card key={activity.id} className={activity.completed ? "opacity-75" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg mt-1 ${activity.completed ? 'bg-green-100' : 'bg-primary/10'}`}>
                              {activity.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                getActivityIcon(activity.type)
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">
                                  {getActivityTypeLabel(activity.type)}
                                </Badge>
                                {activity.completed && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    Concluída
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(activity.created_at)}
                                </span>
                              </div>
                              <p className={`text-sm font-medium mb-1 ${activity.completed ? 'line-through' : ''}`}>
                                {activity.description}
                              </p>
                              {activity.leads && (
                                <p className="text-sm text-muted-foreground">
                                  {(activity.leads as any).first_name} {(activity.leads as any).last_name} • {(activity.leads as any).company}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Activities;

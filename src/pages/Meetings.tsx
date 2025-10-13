/**
 * Meetings Page
 * 
 * Página principal de reuniões com calendário visual e lista de reuniões.
 * Permite criar, editar, visualizar e gerenciar reuniões.
 */

import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/Calendar";
import { MeetingScheduler } from "@/components/MeetingScheduler";
import { useAuth } from "@/hooks/useAuth";
import {
  useUserMeetings,
  useMeetingStats,
  useCreateMeeting,
  useUpdateMeeting,
  useDeleteMeeting,
  useCompleteMeeting,
  useCancelMeeting,
} from "@/hooks/useMeetings";
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { Meeting, MeetingFormData } from "@/types/meeting";
import { getMeetingStatusConfig, getMeetingTypeConfig, formatMeetingTime } from "@/types/meeting";
import { SlotInfo } from "react-big-calendar";

export default function Meetings() {
  const { user } = useAuth();
  const [showScheduler, setShowScheduler] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | undefined>();

  // Queries
  const { data: meetingsData, isLoading } = useUserMeetings();
  const { data: stats } = useMeetingStats();
  const meetings = meetingsData?.meetings || [];

  // Mutations
  const createMeetingMutation = useCreateMeeting();
  const updateMeetingMutation = useUpdateMeeting();
  const deleteMeetingMutation = useDeleteMeeting();
  const completeMeetingMutation = useCompleteMeeting();
  const cancelMeetingMutation = useCancelMeeting();

  const handleCreateMeeting = (data: MeetingFormData) => {
    createMeetingMutation.mutate(data);
    setShowScheduler(false);
    setSelectedSlotTime(undefined);
  };

  const handleUpdateMeeting = (data: MeetingFormData) => {
    if (!editingMeeting) return;
    updateMeetingMutation.mutate({
      id: editingMeeting.id,
      updates: data,
    });
    setEditingMeeting(null);
  };

  const handleDeleteMeeting = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta reunião?")) {
      deleteMeetingMutation.mutate(id);
    }
  };

  const handleCompleteMeeting = (id: string) => {
    completeMeetingMutation.mutate({ id });
  };

  const handleCancelMeeting = (id: string) => {
    const reason = prompt("Motivo do cancelamento (opcional):");
    cancelMeetingMutation.mutate({ id, reason: reason || undefined });
  };

  const handleSelectMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlotTime(slotInfo.start.toISOString());
    setShowScheduler(true);
  };

  const handleOpenScheduler = () => {
    setSelectedSlotTime(undefined);
    setShowScheduler(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Reuniões</h1>
            <Button onClick={handleOpenScheduler}>
              <Plus className="h-4 w-4 mr-2" />
              Agendar Reunião
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Estatísticas */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Reuniões agendadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.today || 0}</div>
                <p className="text-xs text-muted-foreground">Reuniões hoje</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximas</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.upcoming || 0}</div>
                <p className="text-xs text-muted-foreground">Agendadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </CardContent>
            </Card>
          </div>

          {/* Calendário */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-muted-foreground">Carregando calendário...</div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Calendar
              meetings={meetings}
              onSelectMeeting={handleSelectMeeting}
              onSelectSlot={handleSelectSlot}
            />
          )}

          {/* Lista de próximas reuniões */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Reuniões</CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-muted-foreground mb-4">
                    Nenhuma reunião agendada
                  </p>
                  <Button onClick={handleOpenScheduler}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar primeira reunião
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.slice(0, 10).map((meeting) => {
                    const statusConfig = getMeetingStatusConfig(meeting.status);
                    const typeConfig = getMeetingTypeConfig(meeting.type);

                    return (
                      <div
                        key={meeting.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => setEditingMeeting(meeting)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{meeting.title}</h3>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: statusConfig.bgColor,
                                color: statusConfig.color,
                              }}
                              className="text-xs"
                            >
                              {statusConfig.icon} {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {typeConfig.icon} {typeConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatMeetingTime(meeting.start_time, meeting.end_time)}
                          </p>
                          {meeting.location && (
                            <p className="text-xs text-muted-foreground mt-1">
                              📍 {meeting.location}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {meeting.status === "scheduled" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteMeeting(meeting.id);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelMeeting(meeting.id);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Dialog de agendamento */}
      <MeetingScheduler
        open={showScheduler}
        onOpenChange={setShowScheduler}
        onSubmit={handleCreateMeeting}
        isLoading={createMeetingMutation.isPending}
        defaultStartTime={selectedSlotTime}
      />

      {/* Dialog de edição */}
      <MeetingScheduler
        open={!!editingMeeting}
        onOpenChange={(open) => !open && setEditingMeeting(null)}
        onSubmit={handleUpdateMeeting}
        meeting={editingMeeting}
        isLoading={updateMeetingMutation.isPending}
      />
    </SidebarProvider>
  );
}

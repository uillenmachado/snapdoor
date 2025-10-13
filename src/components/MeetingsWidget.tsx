/**
 * MeetingsWidget Component
 * 
 * Widget compacto para o Dashboard mostrando próximas reuniões.
 * Permite visualizar e realizar ações rápidas nas reuniões.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MeetingScheduler } from "./MeetingScheduler";
import { useUpcomingMeetings, useCreateMeeting, useCompleteMeeting, useCancelMeeting } from "@/hooks/useMeetings";
import { Plus, Calendar, Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { formatMeetingTime, getMeetingStatusConfig, getMeetingTypeConfig } from "@/types/meeting";
import type { Meeting, MeetingFormData } from "@/types/meeting";

export function MeetingsWidget() {
  const [showScheduler, setShowScheduler] = useState(false);
  const { data: meetings = [], isLoading } = useUpcomingMeetings();
  const createMeetingMutation = useCreateMeeting();
  const completeMeetingMutation = useCompleteMeeting();
  const cancelMeetingMutation = useCancelMeeting();

  const upcomingMeetings = meetings.slice(0, 5);

  const handleCreateMeeting = (data: MeetingFormData) => {
    createMeetingMutation.mutate(data);
    setShowScheduler(false);
  };

  const handleCompleteMeeting = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    completeMeetingMutation.mutate({ id });
  };

  const handleCancelMeeting = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reason = prompt("Motivo do cancelamento (opcional):");
    cancelMeetingMutation.mutate({ id, reason: reason || undefined });
  };

  const handleOpenMeetingLink = (link: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(link, "_blank");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Próximas Reuniões</span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-sm text-muted-foreground">
            Carregando...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Próximas Reuniões</span>
            <div className="flex items-center gap-2">
              {upcomingMeetings.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {upcomingMeetings.length}
                </Badge>
              )}
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-sm text-muted-foreground mb-3">
                Nenhuma reunião agendada
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowScheduler(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agendar Reunião
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => {
                const statusConfig = getMeetingStatusConfig(meeting.status);
                const typeConfig = getMeetingTypeConfig(meeting.type);

                return (
                  <div
                    key={meeting.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    {/* Ícone do tipo */}
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        backgroundColor: typeConfig.bgColor,
                        color: typeConfig.color,
                      }}
                    >
                      {typeConfig.icon}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {meeting.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {formatMeetingTime(meeting.start_time, meeting.end_time)}
                      </div>
                      {meeting.location && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          📍 {meeting.location}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-1">
                      {meeting.type === "video" && meeting.meeting_link && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => handleOpenMeetingLink(meeting.meeting_link!, e)}
                          title="Abrir link da reunião"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      {meeting.status === "scheduled" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                            onClick={(e) => handleCompleteMeeting(meeting.id, e)}
                            title="Marcar como concluída"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            onClick={(e) => handleCancelMeeting(meeting.id, e)}
                            title="Cancelar reunião"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowScheduler(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Reunião
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de agendamento */}
      <MeetingScheduler
        open={showScheduler}
        onOpenChange={setShowScheduler}
        onSubmit={handleCreateMeeting}
        isLoading={createMeetingMutation.isPending}
      />
    </>
  );
}

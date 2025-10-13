/**
 * Calendar Component
 * 
 * Componente de calendário usando react-big-calendar para visualizar reuniões.
 * Suporta diferentes views (mês, semana, dia, agenda) e interação com eventos.
 */

import { useMemo, useState, useCallback } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, View, SlotInfo } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import type { Meeting } from "@/types/meeting";
import { getMeetingStatusConfig, getMeetingTypeConfig } from "@/types/meeting";

// Configurar localizer do calendário
const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Mensagens em português
const messages = {
  allDay: "Dia todo",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Não há reuniões neste período.",
  showMore: (total: number) => `+${total} mais`,
};

interface CalendarProps {
  meetings: Meeting[];
  onSelectMeeting?: (meeting: Meeting) => void;
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  defaultView?: View;
  className?: string;
}

export function Calendar({
  meetings,
  onSelectMeeting,
  onSelectSlot,
  defaultView = "month",
  className = "",
}: CalendarProps) {
  const [view, setView] = useState<View>(defaultView);
  const [date, setDate] = useState(new Date());

  // Converter meetings para eventos do calendário
  const events = useMemo(() => {
    return meetings.map((meeting) => {
      const statusConfig = getMeetingStatusConfig(meeting.status);
      const typeConfig = getMeetingTypeConfig(meeting.type);

      return {
        id: meeting.id,
        title: meeting.title,
        start: new Date(meeting.start_time),
        end: new Date(meeting.end_time),
        resource: meeting, // Dados completos da reunião
        allDay: false,
        style: {
          backgroundColor: statusConfig.bgColor,
          color: statusConfig.color,
          border: `1px solid ${statusConfig.color}`,
        },
      };
    });
  }, [meetings]);

  // Handler para clicar em evento
  const handleSelectEvent = useCallback(
    (event: any) => {
      if (onSelectMeeting && event.resource) {
        onSelectMeeting(event.resource as Meeting);
      }
    },
    [onSelectMeeting]
  );

  // Handler para clicar em slot vazio (criar novo)
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      if (onSelectSlot) {
        onSelectSlot(slotInfo);
      }
    },
    [onSelectSlot]
  );

  // Customizar estilo dos eventos
  const eventStyleGetter = useCallback((event: any) => {
    return {
      style: event.style,
    };
  }, []);

  // Navegar no calendário
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Toolbar customizado
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        {/* Navegação */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate("PREV")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => onNavigate("TODAY")}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNavigate("NEXT")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Label (Mês/Ano) */}
        <h2 className="text-xl font-semibold">{label}</h2>

        {/* Views */}
        <div className="flex gap-1">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => onView("month")}
          >
            Mês
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onView("week")}
          >
            Semana
          </Button>
          <Button
            variant={view === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => onView("day")}
          >
            Dia
          </Button>
          <Button
            variant={view === "agenda" ? "default" : "outline"}
            size="sm"
            onClick={() => onView("agenda")}
          >
            Agenda
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          date={date}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          messages={messages}
          culture="pt-BR"
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          formats={{
            dateFormat: "dd",
            dayFormat: (date, culture, localizer) =>
              localizer?.format(date, "EEEE", culture) || "",
            dayHeaderFormat: (date, culture, localizer) =>
              localizer?.format(date, "EEEE, dd/MM", culture) || "",
            dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
              `${localizer?.format(start, "dd/MM", culture)} - ${localizer?.format(
                end,
                "dd/MM",
                culture
              )}`,
            agendaDateFormat: "dd/MM/yyyy",
            agendaTimeFormat: "HH:mm",
            agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer?.format(start, "HH:mm", culture)} - ${localizer?.format(
                end,
                "HH:mm",
                culture
              )}`,
          }}
        />
      </CardContent>
    </Card>
  );
}

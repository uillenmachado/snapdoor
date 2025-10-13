/**
 * MeetingScheduler Component
 * 
 * Dialog para agendar e editar reuniões com:
 * - Date e time pickers
 * - Seleção de tipo (vídeo, telefone, presencial)
 * - Relacionamentos opcionais (lead, company, deal)
 * - Validações
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Meeting, MeetingFormData, MeetingStatus, MeetingType } from "@/types/meeting";
import { MEETING_STATUS_CONFIG, MEETING_TYPE_CONFIG } from "@/types/meeting";

interface MeetingSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MeetingFormData) => void;
  meeting?: Meeting | null;
  isLoading?: boolean;
  leadId?: string;
  companyId?: string;
  dealId?: string;
  defaultStartTime?: string; // ISO string
}

export function MeetingScheduler({
  open,
  onOpenChange,
  onSubmit,
  meeting,
  isLoading = false,
  leadId,
  companyId,
  dealId,
  defaultStartTime,
}: MeetingSchedulerProps) {
  const isEditMode = !!meeting;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MeetingFormData>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      type: "video",
      status: "scheduled",
      start_time: defaultStartTime || "",
      end_time: "",
      lead_id: leadId,
      company_id: companyId,
      deal_id: dealId,
    },
  });

  const statusValue = watch("status");
  const typeValue = watch("type");
  const startTimeValue = watch("start_time");

  // Reset form quando abrir/fechar ou mudar reunião
  useEffect(() => {
    if (open) {
      if (meeting) {
        // Modo edição: preencher com dados da reunião
        reset({
          title: meeting.title,
          description: meeting.description || "",
          location: meeting.location || "",
          type: meeting.type,
          status: meeting.status,
          start_time: meeting.start_time,
          end_time: meeting.end_time,
          meeting_link: meeting.meeting_link || "",
          lead_id: meeting.lead_id || leadId,
          company_id: meeting.company_id || companyId,
          deal_id: meeting.deal_id || dealId,
        });
      } else {
        // Modo criação: valores padrão
        const now = new Date();
        const startTime = defaultStartTime || now.toISOString().slice(0, 16);
        const endTime = new Date(now.getTime() + 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16);

        reset({
          title: "",
          description: "",
          location: "",
          type: "video",
          status: "scheduled",
          start_time: startTime,
          end_time: endTime,
          meeting_link: "",
          lead_id: leadId,
          company_id: companyId,
          deal_id: dealId,
        });
      }
    }
  }, [open, meeting, reset, leadId, companyId, dealId, defaultStartTime]);

  // Auto-calcular end_time (1 hora após start_time)
  useEffect(() => {
    if (startTimeValue && !isEditMode) {
      const startDate = new Date(startTimeValue);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      setValue("end_time", endDate.toISOString().slice(0, 16));
    }
  }, [startTimeValue, isEditMode, setValue]);

  const handleFormSubmit = (data: MeetingFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Reunião" : "Agendar Reunião"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informações da reunião."
              : "Preencha os detalhes para agendar uma nova reunião."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Reunião de alinhamento"
                {...register("title", {
                  required: "Título é obrigatório",
                  minLength: {
                    value: 3,
                    message: "Título deve ter no mínimo 3 caracteres",
                  },
                })}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Tipo e Status */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={typeValue}
                  onValueChange={(value) => setValue("type", value as MeetingType)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEETING_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          {config.icon} {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusValue}
                  onValueChange={(value) =>
                    setValue("status", value as MeetingStatus)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEETING_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          {config.icon} {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              {/* Início */}
              <div className="space-y-2">
                <Label htmlFor="start_time">
                  Início <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  {...register("start_time", {
                    required: "Data de início é obrigatória",
                  })}
                  disabled={isLoading}
                />
                {errors.start_time && (
                  <p className="text-sm text-destructive">
                    {errors.start_time.message}
                  </p>
                )}
              </div>

              {/* Fim */}
              <div className="space-y-2">
                <Label htmlFor="end_time">
                  Fim <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  {...register("end_time", {
                    required: "Data de término é obrigatória",
                  })}
                  disabled={isLoading}
                />
                {errors.end_time && (
                  <p className="text-sm text-destructive">
                    {errors.end_time.message}
                  </p>
                )}
              </div>
            </div>

            {/* Local/Link */}
            <div className="space-y-2">
              <Label htmlFor="location">Local ou Link da Reunião</Label>
              <Input
                id="location"
                placeholder={
                  typeValue === "video"
                    ? "https://meet.google.com/..."
                    : typeValue === "in_person"
                    ? "Endereço físico"
                    : "Informações de contato"
                }
                {...register("location")}
                disabled={isLoading}
              />
            </div>

            {/* Link adicional (para videoconferência) */}
            {typeValue === "video" && (
              <div className="space-y-2">
                <Label htmlFor="meeting_link">Link da Videoconferência</Label>
                <Input
                  id="meeting_link"
                  type="url"
                  placeholder="https://zoom.us/..."
                  {...register("meeting_link")}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Opcional: Link adicional para Zoom, Teams, etc.
                </p>
              </div>
            )}

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição/Agenda</Label>
              <Textarea
                id="description"
                placeholder="Pauta da reunião, tópicos a discutir..."
                rows={4}
                {...register("description")}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Salvando..."
                : isEditMode
                ? "Atualizar"
                : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

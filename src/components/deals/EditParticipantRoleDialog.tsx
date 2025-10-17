import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Tipagem do participante
interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  company?: string;
  email?: string;
}

interface Participant {
  id: string;
  lead_id: string;
  deal_id: string;
  role: string;
  is_primary: boolean;
  lead?: Lead;
}

interface EditParticipantRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant;
  onSuccess: () => void;
}

// Mapeamento de roles
const roleLabels: Record<string, string> = {
  decision_maker: "Decisor",
  influencer: "Influenciador",
  user: "Usuário",
  technical: "Técnico",
  champion: "Champion",
  participant: "Participante",
};

const roleColors: Record<string, string> = {
  decision_maker: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  influencer: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  user: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  technical: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  champion: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  participant: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

export function EditParticipantRoleDialog({
  open,
  onOpenChange,
  participant,
  onSuccess,
}: EditParticipantRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>(participant.role);
  const [isLoading, setIsLoading] = useState(false);

  const lead = participant.lead;
  if (!lead) return null;

  const getInitials = () => {
    return `${lead.first_name[0] || ""}${lead.last_name[0] || ""}`.toUpperCase();
  };

  const handleSave = async () => {
    if (!selectedRole || selectedRole === participant.role) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { error } = await supabase
        .from("deal_participants")
        .update({ role: selectedRole })
        .eq("id", participant.id);

      if (error) throw error;

      toast({
        title: "Papel atualizado!",
        description: `${lead.first_name} agora é ${roleLabels[selectedRole]}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar papel:", error);
      toast({
        title: "Erro ao atualizar papel",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Papel do Participante</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Card do participante */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
            <Avatar className="h-12 w-12">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-base">
                  {lead.first_name} {lead.last_name}
                </p>
                {participant.is_primary && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                    Principal
                  </Badge>
                )}
              </div>

              {(lead.job_title || lead.company) && (
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                  {lead.job_title && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{lead.job_title}</span>
                    </div>
                  )}
                  {lead.job_title && lead.company && <span>•</span>}
                  {lead.company && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{lead.company}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Role atual */}
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={roleColors[participant.role] || roleColors.participant}
                >
                  {roleLabels[participant.role] || "Participante"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Seletor de novo role */}
          <div className="space-y-2">
            <Label htmlFor="role">Novo Papel</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="decision_maker">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    Decisor
                  </div>
                </SelectItem>
                <SelectItem value="influencer">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Influenciador
                  </div>
                </SelectItem>
                <SelectItem value="champion">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Champion
                  </div>
                </SelectItem>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Usuário
                  </div>
                </SelectItem>
                <SelectItem value="technical">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    Técnico
                  </div>
                </SelectItem>
                <SelectItem value="participant">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    Participante
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {selectedRole && selectedRole !== participant.role && (
              <p className="text-sm text-muted-foreground">
                Será alterado de <strong>{roleLabels[participant.role]}</strong> para{" "}
                <strong>{roleLabels[selectedRole]}</strong>
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

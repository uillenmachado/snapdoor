import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  Building2,
  Briefcase,
  MoreVertical,
  Star,
  Trash,
  Edit,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { EditParticipantRoleDialog } from "./EditParticipantRoleDialog";

interface Participant {
  id: string;
  lead_id: string;
  deal_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
  lead?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    job_title?: string;
    company?: string;
    company_id?: string;
  };
}

interface ParticipantCardProps {
  participant: Participant;
  onRemove: (participantId: string) => void;
  onSetPrimary: (participantId: string) => void;
  onChangeRole: () => void;
}

const roleLabels: Record<string, string> = {
  decision_maker: "Decisor",
  influencer: "Influenciador",
  user: "Usuário",
  technical: "Técnico",
  champion: "Defensor",
  participant: "Participante",
};

const roleColors: Record<string, string> = {
  decision_maker: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  influencer: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  user: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  technical: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  champion: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  participant: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

export function ParticipantCard({
  participant,
  onRemove,
  onSetPrimary,
  onChangeRole,
}: ParticipantCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const lead = participant.lead;
  
  if (!lead) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Dados do participante não encontrados
          </p>
        </CardContent>
      </Card>
    );
  }

  const fullName = `${lead.first_name} ${lead.last_name}`;
  const initials = `${lead.first_name[0]}${lead.last_name[0]}`.toUpperCase();
  
  const handleEmailClick = () => {
    if (lead.email) {
      window.location.href = `mailto:${lead.email}`;
    } else {
      toast.error("Email não disponível");
    }
  };

  const handlePhoneClick = () => {
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`;
    } else {
      toast.error("Telefone não disponível");
    }
  };

  return (
    <>
    <Card className={`relative transition-all hover:shadow-md ${participant.is_primary ? 'border-primary border-2' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header: Nome + Badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-base truncate">{fullName}</h4>
                  {participant.is_primary && (
                    <Badge variant="default" className="gap-1 text-xs">
                      <Crown className="h-3 w-3" />
                      Principal
                    </Badge>
                  )}
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${roleColors[participant.role] || roleColors.participant}`}
                  >
                    {roleLabels[participant.role] || participant.role}
                  </Badge>
                </div>
                
                {/* Cargo e Empresa */}
                {(lead.job_title || lead.company) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    {lead.job_title && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {lead.job_title}
                      </span>
                    )}
                    {lead.job_title && lead.company && <span>•</span>}
                    {lead.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {lead.company}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!participant.is_primary && (
                    <>
                      <DropdownMenuItem onClick={() => onSetPrimary(participant.id)}>
                        <Star className="h-4 w-4 mr-2" />
                        Marcar como Principal
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Papel
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onRemove(participant.id)}
                    className="text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-3 text-sm">
              {lead.email && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:text-primary text-muted-foreground"
                  onClick={handleEmailClick}
                >
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  <span className="truncate max-w-[200px]">{lead.email}</span>
                </Button>
              )}
              
              {lead.phone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:text-primary text-muted-foreground"
                  onClick={handlePhoneClick}
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  {lead.phone}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Dialog de edição de papel */}
    <EditParticipantRoleDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      participant={participant}
      onSuccess={onChangeRole}
    />
    </>
  );
}

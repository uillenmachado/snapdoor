// @ts-nocheck
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, Shield, Clock, XCircle } from "lucide-react";
import { useInviteUser, useCancelInvitation, useTeamInvitations, TeamRole } from "@/hooks/useTeam";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InviteUserProps {
  teamId: string;
}

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  member: "Membro",
};

const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  admin: "Acesso total ao time e configurações",
  manager: "Gerenciar membros e visualizar tudo",
  member: "Acesso básico a leads e deals",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  accepted: "bg-green-500",
  declined: "bg-red-500",
  expired: "bg-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  declined: "Recusado",
  expired: "Expirado",
};

export const InviteUser = ({ teamId }: InviteUserProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("member");

  const inviteUserMutation = useInviteUser();
  const cancelInvitationMutation = useCancelInvitation();
  const { data: invitations, isLoading: invitationsLoading } = useTeamInvitations(teamId);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !role) {
      return;
    }

    await inviteUserMutation.mutateAsync({
      teamId,
      email,
      role,
    });

    setEmail("");
    setRole("member");
    setOpen(false);
  };

  const handleCancel = async (invitationId: string) => {
    if (confirm("Tem certeza que deseja cancelar este convite?")) {
      await cancelInvitationMutation.mutateAsync({ invitationId, teamId });
    }
  };

  const pendingInvitations = invitations?.filter(inv => inv.status === "pending") || [];

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar Membro
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite por email para adicionar um novo membro ao time.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Cargo
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{ROLE_LABELS[r]}</span>
                          <span className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteUserMutation.isPending}>
                {inviteUserMutation.isPending ? "Enviando..." : "Enviar Convite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lista de convites pendentes */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              {pendingInvitations.length} convite(s) aguardando resposta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invitation.email}</span>
                      <Badge variant="outline" className="ml-2">
                        {ROLE_LABELS[invitation.role]}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Convidado por {invitation.inviter?.fullName || invitation.inviter?.email}
                      {" • "}
                      {format(new Date(invitation.invitedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {" • "}
                      Expira em {format(new Date(invitation.expiresAt), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(invitation.id)}
                    disabled={cancelInvitationMutation.isPending}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de todos os convites */}
      {!invitationsLoading && invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Convites</CardTitle>
            <CardDescription>
              Todos os convites enviados para este time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invitation.email}</span>
                      <Badge variant="outline">
                        {ROLE_LABELS[invitation.role]}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[invitation.status]}`} />
                        <span className="text-xs text-muted-foreground">
                          {STATUS_LABELS[invitation.status]}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(invitation.invitedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {invitation.acceptedAt && (
                        <> • Aceito em {format(new Date(invitation.acceptedAt), "dd/MM/yyyy", { locale: ptBR })}</>
                      )}
                      {invitation.declinedAt && (
                        <> • Recusado em {format(new Date(invitation.declinedAt), "dd/MM/yyyy", { locale: ptBR })}</>
                      )}
                    </div>
                  </div>

                  {invitation.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(invitation.id)}
                      disabled={cancelInvitationMutation.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

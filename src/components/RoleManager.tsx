// @ts-nocheck
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MoreVertical, Shield, UserMinus, ArrowRightLeft, Crown } from "lucide-react";
import { useTeamMembers, useTeam, useUpdateMemberRole, useRemoveMember, useTransferOwnership, TeamRole } from "@/hooks/useTeam";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RoleManagerProps {
  teamId: string;
}

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  member: "Membro",
};

const ROLE_COLORS: Record<TeamRole, string> = {
  admin: "bg-purple-500",
  manager: "bg-blue-500",
  member: "bg-green-500",
};

export const RoleManager = ({ teamId }: RoleManagerProps) => {
  const { user } = useAuth();
  const { data: team } = useTeam(teamId);
  const { data: members, isLoading } = useTeamMembers(teamId);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const transferOwnershipMutation = useTransferOwnership();

  const [editingMember, setEditingMember] = useState<any>(null);
  const [newRole, setNewRole] = useState<TeamRole>("member");
  const [transferringOwnership, setTransferringOwnership] = useState<any>(null);

  const currentUserMember = members?.find(m => m.userId === user?.id);
  const isCurrentUserAdmin = currentUserMember?.role === "admin";
  const isTeamOwner = team?.ownerId === user?.id;

  const handleUpdateRole = async () => {
    if (!editingMember || !newRole) return;

    await updateRoleMutation.mutateAsync({
      memberId: editingMember.id,
      role: newRole,
    });

    setEditingMember(null);
  };

  const handleRemoveMember = async (member: any) => {
    if (member.userId === user?.id) {
      alert("Você não pode remover a si mesmo do time!");
      return;
    }

    if (member.userId === team?.ownerId) {
      alert("Você não pode remover o proprietário do time!");
      return;
    }

    if (confirm(`Tem certeza que deseja remover ${member.profile?.fullName || member.profile?.email} do time?`)) {
      await removeMemberMutation.mutateAsync({
        memberId: member.id,
        teamId,
      });
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferringOwnership) return;

    if (confirm(`Tem certeza que deseja transferir a propriedade do time para ${transferringOwnership.profile?.fullName || transferringOwnership.profile?.email}? Esta ação não pode ser desfeita.`)) {
      await transferOwnershipMutation.mutateAsync({
        teamId,
        newOwnerId: transferringOwnership.userId,
      });

      setTransferringOwnership(null);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || "??";
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando membros...</div>;
  }

  if (!members || members.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum membro no time.</div>;
  }

  return (
    <>
      <Table>
        <TableCaption>Lista de membros do time com seus respectivos cargos</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Membro</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Membro desde</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isOwner = member.userId === team?.ownerId;
            const isCurrentUser = member.userId === user?.id;
            const canEdit = isCurrentUserAdmin && !isCurrentUser;

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profile?.avatarUrl} />
                      <AvatarFallback>
                        {getInitials(member.profile?.fullName, member.profile?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {member.profile?.fullName || member.profile?.email}
                        {isOwner && (
                          <Crown className="h-4 w-4 text-yellow-500" title="Proprietário" />
                        )}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-1">Você</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{member.profile?.email}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ROLE_COLORS[member.role]}`} />
                    {ROLE_LABELS[member.role]}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>
                    {member.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {format(new Date(member.joinedAt), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>

                <TableCell className="text-right">
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingMember(member);
                            setNewRole(member.role);
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Alterar Cargo
                        </DropdownMenuItem>
                        {isTeamOwner && !isOwner && (
                          <DropdownMenuItem onClick={() => setTransferringOwnership(member)}>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Transferir Propriedade
                          </DropdownMenuItem>
                        )}
                        {!isOwner && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveMember(member)}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remover do Time
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Dialog: Alterar Cargo */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Cargo</DialogTitle>
            <DialogDescription>
              Alterando o cargo de {editingMember?.profile?.fullName || editingMember?.profile?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Novo Cargo</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as TeamRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRole} disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Transferir Propriedade */}
      <Dialog open={!!transferringOwnership} onOpenChange={(open) => !open && setTransferringOwnership(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Transferir Propriedade
            </DialogTitle>
            <DialogDescription>
              Você está prestes a transferir a propriedade do time para{" "}
              <strong>{transferringOwnership?.profile?.fullName || transferringOwnership?.profile?.email}</strong>.
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2 text-sm">
            <p className="text-muted-foreground">
              Ao transferir a propriedade:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>O novo proprietário terá controle total do time</li>
              <li>Você será rebaixado para cargo de Admin</li>
              <li>Esta ação é permanente e não pode ser revertida</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferringOwnership(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleTransferOwnership}
              disabled={transferOwnershipMutation.isPending}
            >
              {transferOwnershipMutation.isPending ? "Transferindo..." : "Confirmar Transferência"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

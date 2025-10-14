// @ts-nocheck
// =====================================================
// HOOK: useTeam
// Hooks para gerenciamento de times, membros e permissões
// =====================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// =====================================================
// Types
// =====================================================

export type TeamRole = "admin" | "manager" | "member";
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";
export type MemberStatus = "active" | "inactive" | "invited";

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  visibilityDefault: "own" | "team" | "all";
  allowMemberInvite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  customPermissions: Record<string, boolean>;
  status: MemberStatus;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  profile?: {
    fullName?: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: InvitationStatus;
  acceptedAt?: string;
  declinedAt?: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  // Joined data
  inviter?: {
    fullName?: string;
    email: string;
  };
  team?: {
    name: string;
  };
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  category: string;
  createdAt: string;
}

export interface UserPermissions {
  role: TeamRole;
  permissions: string[];
  customPermissions: Record<string, boolean>;
}

// =====================================================
// Hook: useTeams (buscar times do usuário)
// =====================================================

export const useTeams = () => {
  const { user } = useAuth();

  return useQuery<Team[]>({
    queryKey: ["teams", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      if (error) throw error;

      return (data || []).map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        ownerId: team.owner_id,
        visibilityDefault: team.visibility_default,
        allowMemberInvite: team.allow_member_invite,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
      }));
    },
    enabled: !!user?.id,
  });
};

// =====================================================
// Hook: useTeam (buscar time específico)
// =====================================================

export const useTeam = (teamId?: string) => {
  return useQuery<Team>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        ownerId: data.owner_id,
        visibilityDefault: data.visibility_default,
        allowMemberInvite: data.allow_member_invite,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: !!teamId,
  });
};

// =====================================================
// Hook: useTeamMembers (buscar membros do time)
// =====================================================

export const useTeamMembers = (teamId?: string) => {
  return useQuery<TeamMember[]>({
    queryKey: ["teamMembers", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          *,
          profile:profiles(full_name, email, avatar_url)
        `)
        .eq("team_id", teamId)
        .order("created_at");

      if (error) throw error;

      return (data || []).map((member) => ({
        id: member.id,
        teamId: member.team_id,
        userId: member.user_id,
        role: member.role,
        customPermissions: member.custom_permissions || {},
        status: member.status,
        invitedBy: member.invited_by,
        invitedAt: member.invited_at,
        joinedAt: member.joined_at,
        createdAt: member.created_at,
        updatedAt: member.updated_at,
        profile: member.profile ? {
          fullName: member.profile.full_name,
          email: member.profile.email,
          avatarUrl: member.profile.avatar_url,
        } : undefined,
      }));
    },
    enabled: !!teamId,
  });
};

// =====================================================
// Hook: useTeamInvitations (buscar convites do time)
// =====================================================

export const useTeamInvitations = (teamId?: string) => {
  return useQuery<TeamInvitation[]>({
    queryKey: ["teamInvitations", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_invitations")
        .select(`
          *,
          inviter:profiles!team_invitations_invited_by_fkey(full_name, email),
          team:teams(name)
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((invite) => ({
        id: invite.id,
        teamId: invite.team_id,
        email: invite.email,
        role: invite.role,
        invitedBy: invite.invited_by,
        invitedAt: invite.invited_at,
        expiresAt: invite.expires_at,
        status: invite.status,
        acceptedAt: invite.accepted_at,
        declinedAt: invite.declined_at,
        token: invite.token,
        createdAt: invite.created_at,
        updatedAt: invite.updated_at,
        inviter: invite.inviter ? {
          fullName: invite.inviter.full_name,
          email: invite.inviter.email,
        } : undefined,
        team: invite.team ? {
          name: invite.team.name,
        } : undefined,
      }));
    },
    enabled: !!teamId,
  });
};

// =====================================================
// Hook: useUserPermissions (buscar permissões do usuário)
// =====================================================

export const useUserPermissions = (teamId?: string) => {
  const { user } = useAuth();

  return useQuery<UserPermissions>({
    queryKey: ["userPermissions", user?.id, teamId],
    queryFn: async () => {
      // Buscar membro
      const { data: member, error: memberError } = await supabase
        .from("team_members")
        .select("role, custom_permissions")
        .eq("team_id", teamId)
        .eq("user_id", user?.id)
        .eq("status", "active")
        .single();

      if (memberError) throw memberError;

      // Buscar permissões do role
      const { data: rolePerms, error: permsError } = await supabase
        .from("role_permissions")
        .select(`
          granted,
          permission:permissions(name)
        `)
        .eq("role", member.role)
        .eq("granted", true);

      if (permsError) throw permsError;

      const permissions = rolePerms.map((rp) => rp.permission.name);

      return {
        role: member.role,
        permissions,
        customPermissions: member.custom_permissions || {},
      };
    },
    enabled: !!user?.id && !!teamId,
  });
};

// =====================================================
// Hook: useAllPermissions (buscar todas as permissões)
// =====================================================

export const useAllPermissions = () => {
  return useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("resource", { ascending: true });

      if (error) throw error;

      return (data || []).map((perm) => ({
        id: perm.id,
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
        category: perm.category,
        createdAt: perm.created_at,
      }));
    },
  });
};

// =====================================================
// Mutation: useCreateTeam
// =====================================================

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; visibilityDefault?: "own" | "team" | "all"; allowMemberInvite?: boolean }) => {
      const { data: team, error } = await supabase
        .from("teams")
        .insert({
          name: data.name,
          description: data.description,
          owner_id: user?.id,
          visibility_default: data.visibilityDefault || "team",
          allow_member_invite: data.allowMemberInvite || false,
        })
        .select()
        .single();

      if (error) throw error;
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Time criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar time: ${error.message}`);
    },
  });
};

// =====================================================
// Mutation: useUpdateTeam
// =====================================================

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: Partial<Team> }) => {
      const { data: team, error } = await supabase
        .from("teams")
        .update({
          name: data.name,
          description: data.description,
          visibility_default: data.visibilityDefault,
          allow_member_invite: data.allowMemberInvite,
        })
        .eq("id", teamId)
        .select()
        .single();

      if (error) throw error;
      return team;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] });
      toast.success("Time atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar time: ${error.message}`);
    },
  });
};

// =====================================================
// Mutation: useInviteUser
// =====================================================

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ teamId, email, role }: { teamId: string; email: string; role: TeamRole }) => {
      const { data: invitation, error } = await supabase
        .from("team_invitations")
        .insert({
          team_id: teamId,
          email,
          role,
          invited_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return invitation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teamInvitations", variables.teamId] });
      toast.success(`Convite enviado para ${variables.email}!`);
    },
    onError: (error: any) => {
      toast.error(`Erro ao enviar convite: ${error.message}`);
    },
  });
};

// =====================================================
// Mutation: useUpdateMemberRole
// =====================================================

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role, customPermissions }: { memberId: string; role?: TeamRole; customPermissions?: Record<string, boolean> }) => {
      const updateData: any = {};
      if (role) updateData.role = role;
      if (customPermissions !== undefined) updateData.custom_permissions = customPermissions;

      const { data, error } = await supabase
        .from("team_members")
        .update(updateData)
        .eq("id", memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", data.team_id] });
      toast.success("Membro atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar membro: ${error.message}`);
    },
  });
};

// =====================================================
// Mutation: useRemoveMember
// =====================================================

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, teamId }: { memberId: string; teamId: string }) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      return { memberId, teamId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", data.teamId] });
      toast.success("Membro removido do time!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover membro: ${error.message}`);
    },
  });
};

// =====================================================
// Mutation: useTransferOwnership
// =====================================================

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) => {
      // Atualizar owner do time
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .update({ owner_id: newOwnerId })
        .eq("id", teamId)
        .select()
        .single();

      if (teamError) throw teamError;

      // Garantir que novo owner seja admin
      const { error: memberError } = await supabase
        .from("team_members")
        .update({ role: "admin" })
        .eq("team_id", teamId)
        .eq("user_id", newOwnerId);

      if (memberError) throw memberError;

      return team;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers", variables.teamId] });
      toast.success("Propriedade do time transferida!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao transferir propriedade: ${error.message}`);
    },
  });
};

// =====================================================
// Mutation: useAcceptInvitation
// =====================================================

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ invitationId, token }: { invitationId: string; token: string }) => {
      // Buscar convite
      const { data: invitation, error: inviteError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("id", invitationId)
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (inviteError) throw inviteError;

      // Verificar se expirou
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error("Convite expirado");
      }

      // Adicionar como membro
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: invitation.team_id,
          user_id: user?.id,
          role: invitation.role,
          status: "active",
        });

      if (memberError) throw memberError;

      // Atualizar convite
      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
      toast.success("Convite aceito! Bem-vindo ao time!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao aceitar convite: ${error.message}`);
    },
  });
};

// =====================================================
// Mutation: useCancelInvitation
// =====================================================

export const useCancelInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId, teamId }: { invitationId: string; teamId: string }) => {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
      return { invitationId, teamId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teamInvitations", data.teamId] });
      toast.success("Convite cancelado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao cancelar convite: ${error.message}`);
    },
  });
};

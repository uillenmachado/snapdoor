/**
 * Hook customizado para gerenciar perfil de usuário
 * Combina useProfile, useUpdateProfile e useUploadAvatar em uma interface simplificada
 */

import { useAuth } from './useAuth';
import { useProfile as useProfileQuery, useUpdateProfile, useUploadAvatar, useUpdatePassword, Profile } from './useProfile';

export const useProfileManager = () => {
  const { user } = useAuth();
  const userId = user?.id;

  // Query do perfil
  const profileQuery = useProfileQuery(userId);

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const updatePasswordMutation = useUpdatePassword();

  // Funções simplificadas
  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!userId) throw new Error('User not authenticated');
    return updateProfileMutation.mutateAsync({ userId, updates });
  };

  const uploadAvatar = async (file: File) => {
    if (!userId) throw new Error('User not authenticated');
    return uploadAvatarMutation.mutateAsync({ userId, file });
  };

  const changePassword = async (newPassword: string) => {
    return updatePasswordMutation.mutateAsync({ newPassword });
  };

  return {
    // Data
    profile: profileQuery.data,
    user,
    
    // Loading states
    loading: profileQuery.isLoading,
    updating: updateProfileMutation.isPending,
    uploading: uploadAvatarMutation.isPending,
    
    // Actions
    updateProfile,
    uploadAvatar,
    changePassword,
    
    // Query utils
    refetch: profileQuery.refetch,
  };
};

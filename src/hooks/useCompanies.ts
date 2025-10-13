/**
 * Hooks React Query para gerenciamento de empresas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { Company, CompanyFormData, CompanyFilters } from '@/types/company';
import {
  fetchCompanies,
  fetchCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  fetchCompanyStats,
} from '@/services/companyService';
import { toast } from '@/hooks/use-toast';

const COMPANIES_QUERY_KEY = 'companies';

/**
 * Hook para buscar lista de empresas com filtros e paginação
 */
export function useCompanies(
  filters?: CompanyFilters,
  page = 1,
  pageSize = 20
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY, 'list', filters, page, pageSize],
    queryFn: () => fetchCompanies(filters, page, pageSize),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar empresa por ID
 */
export function useCompany(id?: string) {
  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY, 'detail', id],
    queryFn: () => fetchCompanyById(id!),
    enabled: !!id,
  });
}

/**
 * Hook para buscar estatísticas da empresa (leads, deals)
 */
export function useCompanyStats(id?: string) {
  return useQuery({
    queryKey: [COMPANIES_QUERY_KEY, 'stats', id],
    queryFn: () => fetchCompanyStats(id!),
    enabled: !!id,
  });
}

/**
 * Hook para criar nova empresa
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanyFormData) => createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANIES_QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Empresa criada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar empresa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar empresa
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompanyFormData> }) =>
      updateCompany(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [COMPANIES_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [COMPANIES_QUERY_KEY, 'detail', variables.id],
      });
      toast({
        title: 'Sucesso!',
        description: 'Empresa atualizada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar empresa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para deletar empresa
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANIES_QUERY_KEY] });
      toast({
        title: 'Sucesso!',
        description: 'Empresa deletada com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao deletar empresa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LeadHistory {
  id: string;
  lead_id: string;
  user_id: string;
  status: "won" | "lost";
  deal_value?: number;
  lost_reason?: string;
  notes?: string;
  created_at: string;
  lead_data: {
    first_name: string;
    last_name: string;
    company?: string;
    job_title?: string;
    email?: string;
  };
}

// Hook para marcar lead como ganho
export const useMarkLeadAsWon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      leadId: string;
      dealValue: number;
      notes?: string;
    }) => {
      try {
        // Simular API call - em produção seria uma edge function
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const leadHistory = {
          id: `won_${Date.now()}`,
          lead_id: params.leadId,
          user_id: "current_user",
          status: "won" as const,
          deal_value: params.dealValue,
          notes: params.notes,
          created_at: new Date().toISOString(),
          lead_data: {
            first_name: "Mock",
            last_name: "Lead",
            company: "Test Company"
          }
        };
        
        return leadHistory;
      } catch (error) {
        throw new Error("Erro ao marcar lead como ganho");
      }
    },
    onSuccess: (data) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-history"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      
      toast.success(`Lead marcado como GANHO! Valor: R$ ${data.deal_value?.toFixed(2)}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao marcar lead como ganho");
    }
  });
};

// Hook para marcar lead como perdido
export const useMarkLeadAsLost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      leadId: string;
      lostReason: string;
      notes?: string;
    }) => {
      try {
        // Simular API call - em produção seria uma edge function
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const leadHistory = {
          id: `lost_${Date.now()}`,
          lead_id: params.leadId,
          user_id: "current_user",
          status: "lost" as const,
          lost_reason: params.lostReason,
          notes: params.notes,
          created_at: new Date().toISOString(),
          lead_data: {
            first_name: "Mock",
            last_name: "Lead",
            company: "Test Company"
          }
        };
        
        return leadHistory;
      } catch (error) {
        throw new Error("Erro ao marcar lead como perdido");
      }
    },
    onSuccess: (data) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-history"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      
      toast.error(`Lead marcado como PERDIDO. Motivo: ${data.lost_reason}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao marcar lead como perdido");
    }
  });
};

// Hook para buscar histórico de leads
export const useLeadHistory = (userId?: string) => {
  return useQuery({
    queryKey: ["lead-history", userId],
    queryFn: async () => {
      try {
        // Mock data para demonstração
        const mockHistory: LeadHistory[] = [
          {
            id: "1",
            lead_id: "lead1",
            user_id: userId || "",
            status: "won",
            deal_value: 15000,
            notes: "Cliente fechou pacote premium",
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
            lead_data: {
              first_name: "João",
              last_name: "Silva",
              company: "Tech Solutions",
              job_title: "CEO",
              email: "joao@techsolutions.com"
            }
          },
          {
            id: "2", 
            lead_id: "lead2",
            user_id: userId || "",
            status: "won",
            deal_value: 8500,
            notes: "Venda do pacote básico",
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
            lead_data: {
              first_name: "Maria",
              last_name: "Santos",
              company: "Inovação Digital",
              job_title: "Diretora de Marketing"
            }
          },
          {
            id: "3",
            lead_id: "lead3", 
            user_id: userId || "",
            status: "lost",
            lost_reason: "Preço muito alto",
            notes: "Cliente achou o valor acima do orçamento",
            created_at: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
            lead_data: {
              first_name: "Carlos",
              last_name: "Oliveira",
              company: "StartupXYZ",
              job_title: "Founder"
            }
          }
        ];
        
        return mockHistory;
      } catch (error) {
        throw new Error("Erro ao buscar histórico de leads");
      }
    },
    enabled: !!userId,
  });
};

// Hook para estatísticas do histórico
export const useLeadHistoryStats = (userId?: string) => {
  return useQuery({
    queryKey: ["lead-history-stats", userId],
    queryFn: async () => {
      try {
        // Mock stats para demonstração
        return {
          totalWon: 12,
          totalLost: 8,
          totalRevenue: 145000,
          averageDealValue: 12083.33,
          conversionRate: 60, // 12 ganhos / 20 total
          topLostReasons: [
            { reason: "Preço muito alto", count: 3 },
            { reason: "Escolheu concorrente", count: 2 },
            { reason: "Não tinha necessidade", count: 2 },
            { reason: "Sem orçamento", count: 1 }
          ]
        };
      } catch (error) {
        throw new Error("Erro ao buscar estatísticas");
      }
    },
    enabled: !!userId,
  });
};
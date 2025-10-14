// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// =====================================================
// TYPES
// =====================================================

export type JobType = 'profile' | 'company' | 'search' | 'bulk';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired';
export type LogLevel = 'debug' | 'info' | 'warning' | 'error';

export interface ScraperJob {
  id: string;
  job_type: JobType;
  priority: number;
  linkedin_url: string;
  lead_id?: string;
  company_id?: string;
  user_id: string;
  team_id?: string;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  last_error?: string;
  result?: any;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  webhook_url?: string;
  webhook_delivered: boolean;
  webhook_delivered_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ScraperLog {
  id: string;
  job_id: string;
  level: LogLevel;
  message: string;
  details?: any;
  created_at: string;
}

export interface ScraperStats {
  id: string;
  date: string;
  hour: number;
  user_id: string;
  team_id?: string;
  jobs_total: number;
  jobs_completed: number;
  jobs_failed: number;
  jobs_cancelled: number;
  avg_duration_seconds: number;
  total_credits_used: number;
  rate_limit_hits: number;
  created_at: string;
  updated_at: string;
}

export interface EnqueueJobParams {
  job_type: JobType;
  linkedin_url: string;
  lead_id?: string;
  company_id?: string;
  priority?: number;
  webhook_url?: string;
  metadata?: any;
}

// =====================================================
// HOOKS - QUERIES
// =====================================================

/**
 * Get all scraper jobs for the current user
 */
export const useScraperJobs = (status?: JobStatus, limit = 100) => {
  return useQuery({
    queryKey: ['scraperJobs', status, limit],
    queryFn: async () => {
      let query = supabase
        .from('scraper_queue')
        .select(`
          *,
          leads (
            id,
            full_name,
            email,
            company
          ),
          companies (
            id,
            name,
            domain
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ScraperJob[];
    },
    staleTime: 30 * 1000, // 30 seconds (more frequent for queue monitoring)
    refetchInterval: 10 * 1000, // Auto-refetch every 10s
    enabled: true,
  });
};

/**
 * Get a single scraper job by ID
 */
export const useScraperJob = (jobId: string) => {
  return useQuery({
    queryKey: ['scraperJob', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraper_queue')
        .select(`
          *,
          leads (
            id,
            full_name,
            email,
            company
          ),
          companies (
            id,
            name,
            domain
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data as ScraperJob;
    },
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 5 * 1000, // Auto-refetch every 5s for active job
    enabled: !!jobId,
  });
};

/**
 * Get logs for a specific job
 */
export const useScraperLogs = (jobId: string) => {
  return useQuery({
    queryKey: ['scraperLogs', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraper_logs')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ScraperLog[];
    },
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 5 * 1000, // Auto-refetch for real-time logs
    enabled: !!jobId,
  });
};

/**
 * Get scraper statistics
 */
export const useScraperStats = (days = 7) => {
  return useQuery({
    queryKey: ['scraperStats', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('scraper_stats')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('hour', { ascending: false });

      if (error) throw error;
      return data as ScraperStats[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
};

/**
 * Get queue dashboard summary
 */
export const useQueueDashboard = () => {
  return useQuery({
    queryKey: ['queueDashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraper_queue_dashboard')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000,
    enabled: true,
  });
};

/**
 * Get recent jobs (last 100)
 */
export const useRecentJobs = () => {
  return useQuery({
    queryKey: ['recentJobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraper_recent_jobs')
        .select('*')
        .limit(100);

      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000,
    enabled: true,
  });
};

// =====================================================
// HOOKS - MUTATIONS
// =====================================================

/**
 * Enqueue a new scraper job
 */
export const useEnqueueJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: EnqueueJobParams) => {
      // Check rate limit first
      const { data: canEnqueue, error: rateLimitError } = await supabase
        .rpc('check_rate_limit', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_limit: 10, // 10 jobs per minute
          p_window_minutes: 1
        });

      if (rateLimitError) throw rateLimitError;
      if (!canEnqueue) {
        throw new Error('Rate limit exceeded. Please wait a moment before creating more jobs.');
      }

      // Create job
      const { data, error } = await supabase
        .from('scraper_queue')
        .insert({
          job_type: params.job_type,
          linkedin_url: params.linkedin_url,
          lead_id: params.lead_id,
          company_id: params.company_id,
          priority: params.priority || 0,
          webhook_url: params.webhook_url,
          metadata: params.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
      queryClient.invalidateQueries({ queryKey: ['queueDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
      
      toast({
        title: "Job enfileirado",
        description: `Job #${data.id.substring(0, 8)} adicionado à fila de processamento.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enfileirar job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Retry a failed job
 */
export const useRetryJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase
        .from('scraper_queue')
        .update({
          status: 'pending',
          attempts: 0,
          last_error: null,
          scheduled_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraperJob', data.id] });
      queryClient.invalidateQueries({ queryKey: ['queueDashboard'] });
      
      toast({
        title: "Job reenfileirado",
        description: "O job será processado novamente em breve.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao retentar job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Cancel a pending/processing job
 */
export const useCancelJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase
        .from('scraper_queue')
        .update({
          status: 'cancelled'
        })
        .eq('id', jobId)
        .in('status', ['pending', 'processing'])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraperJob', data.id] });
      queryClient.invalidateQueries({ queryKey: ['queueDashboard'] });
      
      toast({
        title: "Job cancelado",
        description: "O job foi cancelado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Delete a job (only completed/failed/cancelled)
 */
export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('scraper_queue')
        .delete()
        .eq('id', jobId)
        .in('status', ['completed', 'failed', 'cancelled']);

      if (error) throw error;
      return jobId;
    },
    onSuccess: (jobId) => {
      queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
      queryClient.invalidateQueries({ queryKey: ['queueDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
      
      toast({
        title: "Job deletado",
        description: "O job foi removido permanentemente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar job",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Bulk enqueue jobs (for bulk operations)
 */
export const useBulkEnqueueJobs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobs: EnqueueJobParams[]) => {
      // Check rate limit
      const { data: canEnqueue, error: rateLimitError } = await supabase
        .rpc('check_rate_limit', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_limit: 50, // 50 jobs for bulk
          p_window_minutes: 5 // 5 minute window
        });

      if (rateLimitError) throw rateLimitError;
      if (!canEnqueue) {
        throw new Error('Rate limit exceeded. Please wait before creating bulk jobs.');
      }

      // Create all jobs
      const { data, error } = await supabase
        .from('scraper_queue')
        .insert(
          jobs.map(job => ({
            job_type: job.job_type,
            linkedin_url: job.linkedin_url,
            lead_id: job.lead_id,
            company_id: job.company_id,
            priority: job.priority || 0,
            webhook_url: job.webhook_url,
            metadata: job.metadata || {}
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
      queryClient.invalidateQueries({ queryKey: ['queueDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
      
      toast({
        title: "Jobs enfileirados",
        description: `${data.length} jobs adicionados à fila de processamento.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enfileirar jobs",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Clear completed/failed jobs (cleanup)
 */
export const useClearJobs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (status: 'completed' | 'failed' | 'cancelled') => {
      const { error } = await supabase
        .from('scraper_queue')
        .delete()
        .eq('status', status);

      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      queryClient.invalidateQueries({ queryKey: ['scraperJobs'] });
      queryClient.invalidateQueries({ queryKey: ['queueDashboard'] });
      
      toast({
        title: "Jobs limpos",
        description: `Todos os jobs com status "${status}" foram removidos.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao limpar jobs",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get status color for badges
 */
export const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case 'pending':
      return 'default';
    case 'processing':
      return 'blue';
    case 'completed':
      return 'green';
    case 'failed':
      return 'destructive';
    case 'cancelled':
      return 'secondary';
    case 'expired':
      return 'outline';
    default:
      return 'default';
  }
};

/**
 * Get log level color for badges
 */
export const getLogLevelColor = (level: LogLevel): string => {
  switch (level) {
    case 'debug':
      return 'secondary';
    case 'info':
      return 'default';
    case 'warning':
      return 'yellow';
    case 'error':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (job: ScraperJob): number => {
  if (job.status === 'completed') return 100;
  if (job.status === 'failed' || job.status === 'cancelled') return 0;
  if (job.status === 'processing') return 50;
  return 0;
};

/**
 * Format duration
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};

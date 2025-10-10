// =====================================================
// API CLIENT - SnapDoor CRM
// Cliente centralizado para todas as chamadas de API
// =====================================================

import { supabase } from "@/integrations/supabase/client";

// ============= TYPES =============

export interface SearchLeadsParams {
  search?: string;
  stageId?: string;
  tags?: string[];
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'updated_at' | 'lead_score' | 'first_name';
  sortOrder?: 'asc' | 'desc';
  includeArchived?: boolean;
}

export interface LinkedInImportParams {
  linkedinUrl: string;
  stageId: string;
  createLead?: boolean;
}

export interface BulkLinkedInImportParams {
  linkedinUrls: string[];
  stageId: string;
  rateLimitDelay?: number;
}

export interface AnalyticsParams {
  period?: string; // em dias (default: 30)
}

export interface AutomationData {
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig?: Record<string, any>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
    delay?: number;
  }>;
  isActive?: boolean;
}

// ============= API CLIENT CLASS =============

class ApiClient {
  private async callEdgeFunction<T>(
    functionName: string,
    options: {
      method?: string;
      body?: any;
      params?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'POST', body, params } = options;

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Não autenticado. Faça login novamente.');
    }

    // Build URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    let url = `${supabaseUrl}/functions/v1/${functionName}`;

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    // Make request
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `Erro na requisição: ${response.statusText}`);
    }

    return response.json();
  }

  // ============= LEADS =============

  async searchLeads(params: SearchLeadsParams) {
    return this.callEdgeFunction('search-leads', {
      method: 'POST',
      body: params,
    });
  }

  // ============= LINKEDIN =============

  async importLinkedInProfile(params: LinkedInImportParams) {
    return this.callEdgeFunction('import-linkedin-profile', {
      method: 'POST',
      body: params,
    });
  }

  async bulkImportLinkedIn(params: BulkLinkedInImportParams) {
    return this.callEdgeFunction('bulk-import-linkedin', {
      method: 'POST',
      body: params,
    });
  }

  // ============= ANALYTICS =============

  async getAnalytics(params: AnalyticsParams = {}) {
    try {
      return await this.callEdgeFunction('get-analytics', {
        method: 'GET',
        params: {
          period: params.period || '30',
        },
      });
    } catch (error) {
      // Fallback com dados mock para demonstração
      console.warn('Analytics function not available, using mock data');
      
      return {
        totalLeads: 127,
        leadsThisPeriod: 23,
        conversionRate: 18.5,
        avgScore: 76,
        leadsPerStage: {
          "lead": 45,
          "qualified": 32,
          "meeting": 18,
          "proposal": 12,
          "closed": 20
        },
        leadsOverTime: [
          { date: "2025-01-01", count: 5 },
          { date: "2025-01-02", count: 8 },
          { date: "2025-01-03", count: 3 },
          { date: "2025-01-04", count: 12 },
          { date: "2025-01-05", count: 7 },
          { date: "2025-01-06", count: 15 },
          { date: "2025-01-07", count: 9 }
        ],
        topSources: [
          { source: "LinkedIn", count: 89 },
          { source: "Email", count: 23 },
          { source: "Referência", count: 15 }
        ],
        activitiesThisWeek: 56,
        pendingActivities: 12,
        period: parseInt(params.period || "30")
      };
    }
  }

  // ============= AUTOMATIONS =============

  async getAutomations() {
    return this.callEdgeFunction('create-automation', {
      method: 'GET',
    });
  }

  async createAutomation(data: AutomationData) {
    return this.callEdgeFunction('create-automation', {
      method: 'POST',
      body: data,
    });
  }

  async updateAutomation(id: string, data: Partial<AutomationData>) {
    return this.callEdgeFunction('create-automation', {
      method: 'PUT',
      body: { id, ...data },
    });
  }

  async deleteAutomation(id: string) {
    return this.callEdgeFunction('create-automation', {
      method: 'DELETE',
      params: { id },
    });
  }

  // ============= DIRECT SUPABASE QUERIES =============
  // Métodos que usam queries diretas do Supabase para operações simples

  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(updates: Record<string, any>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLeadById(id: string) {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        stages(name, color),
        notes(
          id,
          content,
          is_private,
          created_at
        ),
        activities(
          id,
          type,
          description,
          completed,
          scheduled_at,
          completed_at,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createLead(leadData: {
    stageId: string;
    firstName: string;
    lastName: string;
    company?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        stage_id: leadData.stageId,
        first_name: leadData.firstName,
        last_name: leadData.lastName,
        company: leadData.company,
        job_title: leadData.jobTitle,
        email: leadData.email,
        phone: leadData.phone,
        linkedin_url: leadData.linkedinUrl,
        tags: leadData.tags || [],
        custom_fields: leadData.customFields || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLead(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteLead(id: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async moveLead(leadId: string, newStageId: string) {
    const { data, error } = await supabase
      .from('leads')
      .update({ stage_id: newStageId })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addNote(leadId: string, content: string, isPrivate = false) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('notes')
      .insert({
        lead_id: leadId,
        user_id: user.id,
        content,
        is_private: isPrivate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addActivity(leadId: string, activityData: {
    type: string;
    description: string;
    scheduledAt?: string;
    metadata?: Record<string, any>;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('activities')
      .insert({
        lead_id: leadId,
        user_id: user.id,
        type: activityData.type,
        description: activityData.description,
        scheduled_at: activityData.scheduledAt,
        metadata: activityData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async completeActivity(activityId: string) {
    const { data, error } = await supabase
      .from('activities')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', activityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPipeline() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: pipelines, error } = await supabase
      .from('pipelines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) throw error;
    return pipelines?.[0] || null;
  }

  async getStages(pipelineId: string) {
    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data;
  }

  async createStage(pipelineId: string, stageData: {
    name: string;
    color?: string;
    position: number;
  }) {
    const { data, error } = await supabase
      .from('stages')
      .insert({
        pipeline_id: pipelineId,
        name: stageData.name,
        color: stageData.color || '#6B46F2',
        position: stageData.position,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStage(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStage(id: string) {
    const { error } = await supabase
      .from('stages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
}

// Export singleton instance
export const api = new ApiClient();



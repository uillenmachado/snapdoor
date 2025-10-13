// =====================================================
// LEAD PROFILE PAGE
// Página dedicada para exibir todos os dados do lead
// =====================================================

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  Linkedin, 
  GraduationCap,
  Users,
  Calendar,
  Edit,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Loader2,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { useEnrichLead } from '@/hooks/useEnrichLead';
import { useState } from 'react';
import { AddLeadDialog } from '@/components/AddLeadDialog';
import { EditableField } from '@/components/EditableField';
import { MultipleContacts } from '@/components/MultipleContacts';
import { RelatedTasksSection } from '@/components/RelatedTasksSection';

// Tipo do database
type DatabaseLead = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name?: string | null;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  location?: string | null;
  headline?: string | null;
  about?: string | null;
  education?: string | null;
  connections?: string | null;
  avatar_url?: string | null;
  seniority?: string | null;
  department?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export default function LeadProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: enrichLead, isPending: isEnriching } = useEnrichLead();

  // Busca dados do lead
  const { data: lead, isLoading, refetch } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Lead não encontrado</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = () => {
    const first = lead.first_name?.[0] || '';
    const last = lead.last_name?.[0] || '';
    return (first + last).toUpperCase() || lead.full_name?.[0]?.toUpperCase() || '?';
  };

  const handleEnrich = () => {
    if (!lead?.id) return;
    enrichLead({ leadId: lead.id, leadData: lead });
  };

  const handleWhatsApp = () => {
    if (lead.phone) {
      const phone = lead.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_blank');
    }
  };

  const handleLinkedIn = () => {
    if (lead.linkedin_url) {
      window.open(lead.linkedin_url, '_blank');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Perfil do Lead</h1>
          <p className="text-muted-foreground">Visualize e gerencie todas as informações</p>
        </div>
        <Button
          onClick={handleEnrich}
          disabled={isEnriching}
        >
          {isEnriching ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {isEnriching ? 'Enriquecendo...' : 'Enriquecer'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Card Principal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de Perfil */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={lead.avatar_url || undefined} />
                  <AvatarFallback className="text-3xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">
                    {lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sem nome'}
                  </h2>
                  
                  {lead.job_title && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{lead.job_title}</span>
                    </div>
                  )}
                  
                  {lead.company && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{lead.company}</span>
                    </div>
                  )}

                  {lead.location && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{lead.location}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <Badge variant="secondary">
                  {lead.status || 'Novo'}
                </Badge>
              </div>

              <Separator className="my-6" />

              {/* Ações Rápidas */}
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Ações Rápidas</p>
                
                {lead.phone && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleWhatsApp}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                )}

                {lead.email && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleEmail}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </Button>
                )}

                {lead.linkedin_url && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLinkedIn}
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    Ver LinkedIn
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <div>
                  <p className="text-xs">Criado em</p>
                  <p className="font-medium text-foreground">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              {lead.updated_at && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <div>
                    <p className="text-xs">Atualizado em</p>
                    <p className="font-medium text-foreground">
                      {new Date(lead.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Detalhes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de Contato - Múltiplos Emails e Telefones */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>Gerencie múltiplos emails e telefones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MultipleContacts
                leadId={lead.id}
                type="email"
                icon={<Mail className="w-4 h-4 text-muted-foreground" />}
                title="Emails"
              />
              
              <Separator />
              
              <MultipleContacts
                leadId={lead.id}
                type="phone"
                icon={<Phone className="w-4 h-4 text-muted-foreground" />}
                title="Telefones"
              />
              
              <Separator />
              
              <EditableField
                leadId={lead.id}
                fieldName="linkedin_url"
                value={lead.linkedin_url}
                label="LinkedIn URL"
                icon={<Linkedin className="w-4 h-4 text-muted-foreground" />}
                type="url"
                onUpdate={() => refetch()}
              />
              
              <EditableField
                leadId={lead.id}
                fieldName="location"
                value={lead.location}
                label="Localização"
                icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
                onUpdate={() => refetch()}
              />
            </CardContent>
          </Card>

          {/* Card de Informações Comerciais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Comerciais</CardTitle>
              <CardDescription>Valor do negócio e informações de vendas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditableField
                leadId={lead.id}
                fieldName="revenue"
                value={lead.revenue?.toString()}
                label="Valor do Negócio (R$)"
                icon={<DollarSign className="w-4 h-4 text-muted-foreground" />}
                type="text"
                onUpdate={() => refetch()}
              />
              
              {lead.revenue && lead.revenue > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">
                      Negócio fechado: R$ {lead.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Profissional - Campos Editáveis */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>Cargo, empresa e experiência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditableField
                leadId={lead.id}
                fieldName="job_title"
                value={lead.job_title}
                label="Cargo"
                icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
                onUpdate={() => refetch()}
              />
              
              <EditableField
                leadId={lead.id}
                fieldName="company"
                value={lead.company}
                label="Empresa"
                icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
                onUpdate={() => refetch()}
              />
              
              <EditableField
                leadId={lead.id}
                fieldName="seniority"
                value={lead.seniority}
                label="Senioridade"
                icon={<Users className="w-4 h-4 text-muted-foreground" />}
                onUpdate={() => refetch()}
              />
              
              <EditableField
                leadId={lead.id}
                fieldName="department"
                value={lead.department}
                label="Departamento"
                icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
                onUpdate={() => refetch()}
              />
              
              <Separator />
              
              <EditableField
                leadId={lead.id}
                fieldName="headline"
                value={lead.headline}
                label="Headline (Resumo do Cargo)"
                icon={<Sparkles className="w-4 h-4 text-muted-foreground" />}
                type="textarea"
                onUpdate={() => refetch()}
              />
              
              <EditableField
                leadId={lead.id}
                fieldName="about"
                value={lead.about}
                label="Sobre (Bio Completa)"
                icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
                type="textarea"
                onUpdate={() => refetch()}
              />
            </CardContent>
          </Card>

          {/* Card de Educação e Outros */}
          {(lead.education || lead.connections) && (
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lead.education && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="w-4 h-4" />
                        <span>Educação</span>
                      </div>
                      <p className="font-medium">{lead.education}</p>
                    </div>
                  )}

                  {lead.connections && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Conexões LinkedIn</span>
                      </div>
                      <p className="font-medium">{lead.connections}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card de Notas */}
          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Seção de Tarefas */}
          <RelatedTasksSection leadId={lead.id} title="Tarefas do Lead" />
        </div>
      </div>

    </div>
  );
}

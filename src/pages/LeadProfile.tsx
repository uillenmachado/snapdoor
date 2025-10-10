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
} from 'lucide-react';
import { useEnrichLead } from '@/hooks/useEnrichLead';
import { useState } from 'react';
import { AddLeadDialog } from '@/components/AddLeadDialog';

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
  const { data: lead, isLoading } = useQuery({
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
          {/* Card de Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>Dados de contato e comunicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">
                    {lead.email || (
                      <span className="text-muted-foreground italic">Não informado</span>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>Telefone</span>
                  </div>
                  <p className="font-medium">
                    {lead.phone || (
                      <span className="text-muted-foreground italic">Não informado</span>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </div>
                  {lead.linkedin_url ? (
                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Ver perfil
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground italic">Não informado</p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Localização</span>
                  </div>
                  <p className="font-medium">
                    {lead.location || (
                      <span className="text-muted-foreground italic">Não informado</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Profissional */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>Cargo, empresa e experiência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>Cargo</span>
                  </div>
                  <p className="font-medium">
                    {lead.job_title || (
                      <span className="text-muted-foreground italic">Não informado</span>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>Empresa</span>
                  </div>
                  <p className="font-medium">
                    {lead.company || (
                      <span className="text-muted-foreground italic">Não informado</span>
                    )}
                  </p>
                </div>

                {lead.seniority && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Senioridade</span>
                    </div>
                    <p className="font-medium">{lead.seniority}</p>
                  </div>
                )}

                {lead.department && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>Departamento</span>
                    </div>
                    <p className="font-medium">{lead.department}</p>
                  </div>
                )}
              </div>

              {lead.headline && (
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span>Sobre</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {lead.headline}
                  </p>
                </div>
              )}
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
        </div>
      </div>

    </div>
  );
}

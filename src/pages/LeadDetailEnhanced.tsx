// =====================================================
// LEAD DETAIL PAGE - ENHANCED VERSION
// Página completa com edição inline e enriquecimento
// =====================================================

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  Linkedin, 
  Edit,
  Sparkles,
  ExternalLink,
  Loader2,
  Save,
  X,
  Upload,
  Link as LinkIcon,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { linkedInScraperService } from '@/services/linkedinScraperService';
import { toast } from 'sonner';
import { useState } from 'react';
import { createCompany } from '@/services/companyService';
import { useAuth } from '@/hooks/useAuth';

interface Lead {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company: string | null;
  company_id: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  location: string | null;
  headline: string | null;
  about: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export default function LeadDetailEnhanced() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [isEnriching, setIsEnriching] = useState(false);

  // Buscar lead
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do lead não fornecido');
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Lead;
    },
    enabled: !!id,
  });

  // Mutation para atualizar lead
  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Lead>) => {
      if (!id) throw new Error('ID do lead não fornecido');

      // ⚠️ CAMPOS GERADOS QUE NÃO PODEM SER ATUALIZADOS
      const GENERATED_COLUMNS = ['full_name', 'name']; // full_name é gerado de first_name + last_name
      
      // Limpar campos undefined, null e campos gerados automaticamente
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key, v]) => 
          v !== undefined && 
          v !== null && 
          !GENERATED_COLUMNS.includes(key)
        )
      );

      console.log('🔍 Atualizando lead com:', cleanUpdates);

      const { data, error } = await supabase
        .from('leads')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase:', error);
        console.error('Campos enviados:', cleanUpdates);
        throw error;
      }
      
      console.log('✅ Lead atualizado:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['all-leads'] });
      toast.success('Lead atualizado com sucesso!');
      setIsEditing(false);
      setEditedLead({});
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar lead:', error);
      toast.error('Erro ao atualizar lead: ' + (error.message || 'Tente novamente'));
    },
  });

  // Função para enriquecer lead via LinkedIn
  const handleEnrichFromLinkedIn = async () => {
    if (!lead) return;
    
    const linkedInUrl = editedLead.linkedin_url || lead.linkedin_url;
    
    if (!linkedInUrl) {
      toast.error('Adicione uma URL do LinkedIn primeiro');
      return;
    }

    setIsEnriching(true);
    toast.info('Buscando dados do LinkedIn...');

    try {
      const profileData = await linkedInScraperService.extractProfileData(linkedInUrl);

      if (!profileData) {
        toast.error('Não foi possível extrair dados do LinkedIn. Perfil pode estar privado ou URL inválida.');
        setIsEnriching(false);
        return;
      }

      // Preparar atualizações
      const updates: Partial<Lead> = {
        first_name: profileData.firstName || lead.first_name,
        last_name: profileData.lastName || lead.last_name,
        job_title: profileData.position || profileData.headline || lead.job_title,
        company: profileData.company || lead.company,
        location: profileData.location || lead.location,
        headline: profileData.headline || lead.headline,
        about: profileData.about || lead.about,
        avatar_url: profileData.imageUrl || lead.avatar_url,
        linkedin_url: profileData.profileUrl || linkedInUrl,
      };

      // Criar empresa se não existir
      if (profileData.company && !lead.company_id && user?.id) {
        try {
          const newCompany = await createCompany({
            user_id: user.id,
            name: profileData.company,
          });
          updates.company_id = newCompany.id;
          toast.success(`Empresa "${profileData.company}" criada automaticamente!`);
        } catch (error) {
          console.error('Erro ao criar empresa:', error);
        }
      }

      // Atualizar lead
      await updateLeadMutation.mutateAsync(updates);

      toast.success('Lead enriquecido com sucesso!', {
        description: 'Dados atualizados: nome, cargo, empresa, foto e localização',
      });

    } catch (error) {
      console.error('Erro ao enriquecer lead:', error);
      toast.error('Erro ao enriquecer lead do LinkedIn');
    } finally {
      setIsEnriching(false);
    }
  };

  // Handlers de edição
  const handleStartEdit = () => {
    if (lead) {
      // ⚠️ Remover campos gerados automaticamente antes de editar
      const { full_name, name, ...editableFields } = lead;
      setEditedLead(editableFields);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditedLead({});
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    updateLeadMutation.mutate(editedLead);
  };

  const handleFieldChange = (field: keyof Lead, value: string) => {
    setEditedLead(prev => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Not found state
  if (!lead) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <PageHeader
              title="Lead não encontrado"
              description="O lead que você procura não existe"
              actions={
                <Button onClick={() => navigate('/leads')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Leads
                </Button>
              }
            />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const currentLead = isEditing ? { ...lead, ...editedLead } : lead;
  const getInitials = () => {
    const first = currentLead.first_name?.[0] || '';
    const last = currentLead.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <PageHeader
            title={`${currentLead.first_name || ''} ${currentLead.last_name || ''}`.trim() || 'Lead sem nome'}
            description="Perfil completo do lead"
            actions={
              <>
                <Button
                  onClick={() => navigate('/leads')}
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                
                {!isEditing ? (
                  <>
                    <Button
                      onClick={handleEnrichFromLinkedIn}
                      disabled={isEnriching || !currentLead.linkedin_url}
                      className="bg-gradient-to-r from-brand-green-600 to-brand-green-700 hover:from-brand-green-700 hover:to-brand-green-800"
                    >
                      {isEnriching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enriquecendo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Enriquecer Lead
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleStartEdit}
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      disabled={updateLeadMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={updateLeadMutation.isPending}
                      className="bg-gradient-to-r from-brand-green-600 to-brand-green-700 hover:from-brand-green-700 hover:to-brand-green-800"
                    >
                      {updateLeadMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </>
                )}
              </>
            }
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* Profile Header Card */}
              <Card className="border-2 border-brand-green-200 dark:border-brand-green-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                        <AvatarImage src={currentLead.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-brand-green-500 to-brand-green-600 text-white text-2xl font-bold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-green-600 to-brand-green-700 bg-clip-text text-transparent">
                            {currentLead.first_name} {currentLead.last_name}
                          </h2>
                          {currentLead.headline && (
                            <p className="text-lg text-muted-foreground mt-1">
                              {currentLead.headline}
                            </p>
                          )}
                        </div>
                        {currentLead.status && (
                          <Badge className="bg-brand-green-50 dark:bg-brand-green-900/20 text-brand-green-600 dark:text-brand-green-400 border-brand-green-200 dark:border-brand-green-800">
                            {currentLead.status}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4">
                        {currentLead.job_title && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <span>{currentLead.job_title}</span>
                          </div>
                        )}
                        {currentLead.company && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{currentLead.company}</span>
                          </div>
                        )}
                        {currentLead.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{currentLead.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        {currentLead.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`mailto:${currentLead.email}`)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                        )}
                        {currentLead.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${currentLead.phone}`)}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Telefone
                          </Button>
                        )}
                        {currentLead.linkedin_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(currentLead.linkedin_url!, '_blank')}
                          >
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Form */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Editar Informações
                    </CardTitle>
                    <CardDescription>
                      Atualize os dados do lead abaixo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Nome</Label>
                        <Input
                          id="first_name"
                          value={editedLead.first_name || ''}
                          onChange={(e) => handleFieldChange('first_name', e.target.value)}
                          placeholder="Nome"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Sobrenome</Label>
                        <Input
                          id="last_name"
                          value={editedLead.last_name || ''}
                          onChange={(e) => handleFieldChange('last_name', e.target.value)}
                          placeholder="Sobrenome"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedLead.email || ''}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={editedLead.phone || ''}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          placeholder="+55 11 99999-9999"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="job_title">Cargo</Label>
                        <Input
                          id="job_title"
                          value={editedLead.job_title || ''}
                          onChange={(e) => handleFieldChange('job_title', e.target.value)}
                          placeholder="CEO, CTO, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          value={editedLead.company || ''}
                          onChange={(e) => handleFieldChange('company', e.target.value)}
                          placeholder="Nome da empresa"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4" />
                        URL do LinkedIn
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="linkedin_url"
                          value={editedLead.linkedin_url || ''}
                          onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                          placeholder="https://linkedin.com/in/..."
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        Cole a URL do perfil do LinkedIn para enriquecimento automático (nome, cargo, empresa, foto)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={editedLead.location || ''}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        placeholder="São Paulo, Brasil"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about">Sobre</Label>
                      <Textarea
                        id="about"
                        value={editedLead.about || ''}
                        onChange={(e) => handleFieldChange('about', e.target.value)}
                        placeholder="Informações adicionais sobre o lead..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* About Section */}
              {!isEditing && currentLead.about && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {currentLead.about}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info Card */}
              {!isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentLead.email && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-brand-green-600 dark:text-brand-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{currentLead.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`mailto:${currentLead.email}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {currentLead.phone && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-brand-green-600 dark:text-brand-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Telefone</p>
                            <p className="font-medium">{currentLead.phone}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`tel:${currentLead.phone}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {currentLead.linkedin_url && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Linkedin className="h-5 w-5 text-brand-green-600 dark:text-brand-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">LinkedIn</p>
                            <p className="font-medium truncate max-w-[300px]">{currentLead.linkedin_url}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(currentLead.linkedin_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

/**
 * LeadDetails - Exibe informações detalhadas do lead principal
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  MapPin,
  ExternalLink,
  Calendar,
  Linkedin,
  Globe,
  Edit2,
  Check,
  X,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  name: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email: string | null;
  phone: string | null;
  mobile?: string | null;
  company: string | null;
  position: string | null;
  title?: string | null;
  job_title?: string | null;
  headline?: string | null;
  status: string;
  created_at: string;
  source?: string | null;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  location?: string | null;
  tags?: string[];
  enrichment_data?: any;
  companies?: {
    name: string;
    logo_url?: string | null;
    domain?: string | null;
    industry?: string | null;
  } | null | any; // Aceitar any para compatibilidade com query errors
}

interface LeadDetailsProps {
  lead: Lead | null;
  role?: string;
  onLeadUpdate?: () => void; // Callback para atualizar dados após edição
}

export function LeadDetails({ lead, role, onLeadUpdate }: LeadDetailsProps) {
  // Estados para controle de edição
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Função para iniciar edição de um campo
  const startEditing = (field: string, currentValue: string | null) => {
    setIsEditing(field);
    setEditValues({ ...editValues, [field]: currentValue || '' });
  };

  // Função para cancelar edição
  const cancelEditing = () => {
    setIsEditing(null);
    setEditValues({});
  };

  // Função para salvar campo editado
  const saveField = async (field: string) => {
    if (!lead) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ [field]: editValues[field] || null })
        .eq('id', lead.id);

      if (error) throw error;

      toast.success('Campo atualizado com sucesso!');
      setIsEditing(null);
      
      // Chamar callback para atualizar dados
      if (onLeadUpdate) {
        onLeadUpdate();
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar campo: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!lead) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lead Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum lead principal adicionado</p>
            <p className="text-xs mt-1">Adicione um participante marcado como Decisor</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Construir nome completo de múltiplas fontes
  const fullName = lead.full_name || 
                   lead.name || 
                   (lead.first_name && lead.last_name 
                     ? `${lead.first_name} ${lead.last_name}` 
                     : lead.first_name || lead.last_name);
  
  const displayName = fullName || lead.email || "Lead sem nome";
  
  // Iniciais para avatar fallback
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Informações de cargo
  const jobTitle = lead.headline || lead.title || lead.job_title || lead.position;
  
  // Informações de empresa - verificar se é um objeto válido
  const companyData = lead.companies && typeof lead.companies === 'object' && 'name' in lead.companies 
    ? lead.companies 
    : null;
  const companyName = companyData?.name || lead.company;
  const companyLogo = companyData?.logo_url;
  const companyDomain = companyData?.domain;

  const statusColors: Record<string, string> = {
    lead: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    qualified: "bg-green-500/10 text-green-500 border-green-500/20",
    customer: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    lost: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const roleColors: Record<string, string> = {
    decision_maker: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    influencer: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    champion: "bg-green-500/10 text-green-500 border-green-500/20",
    user: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    technical: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    participant: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  const roleLabels: Record<string, string> = {
    decision_maker: "🎯 Decisor",
    influencer: "💡 Influenciador",
    user: "👤 Usuário",
    technical: "⚙️ Técnico",
    champion: "🏆 Defensor",
    participant: "👥 Participante",
  };

  const statusLabels: Record<string, string> = {
    lead: "Lead",
    qualified: "Qualificado",
    customer: "Cliente",
    lost: "Perdido",
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Lead Principal
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Avatar e Nome */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={lead.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold mb-1 truncate">{displayName}</h3>
            
            {jobTitle && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {jobTitle}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {role && (
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${roleColors[role] || roleColors.participant}`}
                >
                  {roleLabels[role] || role}
                </Badge>
              )}
              
              <Badge 
                variant="outline"
                className={`text-xs ${statusColors[lead.status] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}
              >
                {statusLabels[lead.status] || lead.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Empresa */}
        {companyName && (
          <div className="mb-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {companyLogo ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={companyLogo} alt={companyName} />
                  <AvatarFallback>
                    <Building2 className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Empresa</p>
                <p className="font-semibold truncate">{companyName}</p>
                {companyDomain && (
                  <a 
                    href={`https://${companyDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Globe className="h-3 w-3" />
                    {companyDomain}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Informações de Contato - Editáveis */}
        <div className="space-y-3">
          {/* Email - Editável */}
          <div className="flex items-start gap-3 group">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              {isEditing === 'email' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={editValues.email || ''}
                    onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="email@exemplo.com"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => saveField('email')}
                    disabled={isSaving}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={cancelEditing}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : lead.email ? (
                <div className="flex items-center gap-2">
                  <a 
                    href={`mailto:${lead.email}`}
                    className="text-sm hover:underline text-foreground break-all group-hover:text-primary transition-colors flex-1"
                  >
                    {lead.email}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => startEditing('email', lead.email)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-primary -ml-2"
                  onClick={() => startEditing('email', null)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar email
                </Button>
              )}
            </div>
          </div>

          {/* Telefone - Editável */}
          <div className="flex items-start gap-3 group">
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Phone className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Telefone</p>
              {isEditing === 'phone' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="tel"
                    value={editValues.phone || ''}
                    onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="(11) 99999-9999"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => saveField('phone')}
                    disabled={isSaving}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={cancelEditing}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (lead.phone || lead.mobile) ? (
                <div className="flex items-center gap-2">
                  <a 
                    href={`tel:${lead.phone || lead.mobile}`}
                    className="text-sm hover:underline text-foreground group-hover:text-primary transition-colors flex-1"
                  >
                    {lead.phone || lead.mobile}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => startEditing('phone', lead.phone || lead.mobile)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-primary -ml-2"
                  onClick={() => startEditing('phone', null)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar telefone
                </Button>
              )}
            </div>
          </div>

          {/* Cargo/Título - Editável */}
          <div className="flex items-start gap-3 group">
            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Briefcase className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Cargo</p>
              {isEditing === 'title' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editValues.title || ''}
                    onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="Ex: CEO, Gerente de Vendas"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => saveField('title')}
                    disabled={isSaving}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={cancelEditing}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : jobTitle ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground flex-1">{jobTitle}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => startEditing('title', jobTitle)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-primary -ml-2"
                  onClick={() => startEditing('title', null)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar cargo
                </Button>
              )}
            </div>
          </div>

          {/* Localização - Editável */}
          <div className="flex items-start gap-3 group">
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Localização</p>
              {isEditing === 'location' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editValues.location || ''}
                    onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="Ex: São Paulo, SP"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => saveField('location')}
                    disabled={isSaving}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={cancelEditing}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : lead.location ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground flex-1">{lead.location}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => startEditing('location', lead.location)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-primary -ml-2"
                  onClick={() => startEditing('location', null)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar localização
                </Button>
              )}
            </div>
          </div>

          {/* LinkedIn - Editável */}
          <div className="flex items-start gap-3 group">
            <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Linkedin className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">LinkedIn</p>
              {isEditing === 'linkedin_url' ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    value={editValues.linkedin_url || ''}
                    onChange={(e) => setEditValues({ ...editValues, linkedin_url: e.target.value })}
                    className="h-8 text-sm"
                    placeholder="https://linkedin.com/in/..."
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => saveField('linkedin_url')}
                    disabled={isSaving}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={cancelEditing}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : lead.linkedin_url ? (
                <div className="flex items-center gap-2">
                  <a 
                    href={lead.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline text-foreground truncate flex-1 group-hover:text-primary transition-colors"
                  >
                    Ver Perfil
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => startEditing('linkedin_url', lead.linkedin_url)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-primary -ml-2"
                  onClick={() => startEditing('linkedin_url', null)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar LinkedIn
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Metadados */}
        <div className="mt-6 pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Cadastrado
            </span>
            <span className="font-medium">
              {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
          
          {lead.source && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Origem</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {lead.source}
              </Badge>
            </div>
          )}
        </div>

        {/* Ação */}
        <div className="mt-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full group"
            onClick={() => window.open(`/leads/${lead.id}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            Ver Perfil Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

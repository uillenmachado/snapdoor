import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronsUpDown, X, Users, Building2, DollarSign, Calendar, Loader2, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCreateDeal, useAddDealParticipant } from "@/hooks/useDeals";
import { useLeads } from "@/hooks/useLeads";
import { useCompanies } from "@/hooks/useCompanies";
import { createCompany } from "@/services/companyService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Stage {
  id: string;
  name: string;
  order: number;
  pipeline_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CreateDealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  pipelineId: string;
  stages: Stage[];
}

interface SelectedLead {
  id: string;
  name: string;
  company?: string;
  job_title?: string;
  email?: string;
  role: 'decision_maker' | 'influencer' | 'user' | 'technical' | 'champion' | 'participant';
}

export function CreateDealDialog({ isOpen, onClose, userId, pipelineId, stages }: CreateDealDialogProps) {
  const queryClient = useQueryClient();
  const createDealMutation = useCreateDeal();
  const addParticipantMutation = useAddDealParticipant();
  const { data: allLeads = [] } = useLeads(userId);
  const companiesQuery = useCompanies(undefined, 1, 1000); // Buscar todas empresas
  const allCompanies = companiesQuery.data?.companies || [];

  // ✅ Log único quando dialog abre
  React.useEffect(() => {
    if (isOpen) {
      console.log('🏢 Empresas disponíveis:', {
        total: allCompanies.length,
        loading: companiesQuery.isLoading,
        error: companiesQuery.error,
        rawData: companiesQuery.data,
        empresas: allCompanies.map((c: any) => ({ id: c.id, name: c.name }))
      });
    }
  }, [isOpen, allCompanies.length, companiesQuery.data]);

  const [step, setStep] = useState<'basic' | 'participants'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic info
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [openCompanyCombobox, setOpenCompanyCombobox] = useState(false);
  const [stageId, setStageId] = useState("");
  const [probability, setProbability] = useState("50");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [description, setDescription] = useState("");

  // Participants
  const [selectedLeads, setSelectedLeads] = useState<SelectedLead[]>([]);
  const [openLeadCombobox, setOpenLeadCombobox] = useState(false);
  const [searchLeadValue, setSearchLeadValue] = useState("");
  
  // Novo Lead Inline
  const [isCreatingNewLead, setIsCreatingNewLead] = useState(false);
  const [newLeadFirstName, setNewLeadFirstName] = useState("");
  const [newLeadLastName, setNewLeadLastName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadJobTitle, setNewLeadJobTitle] = useState("");
  const [linkLeadToCompany, setLinkLeadToCompany] = useState(true); // Padrão: vincular

  // Set default stage
  useEffect(() => {
    if (stages && stages.length > 0 && !stageId) {
      setStageId(stages[0].id);
    }
  }, [stages, stageId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('basic');
        setTitle("");
        setValue("");
        setCompanyName("");
        setProbability("50");
        setExpectedCloseDate("");
        setDescription("");
        setSelectedLeads([]);
        setSearchLeadValue("");
        if (stages && stages.length > 0) {
          setStageId(stages[0].id);
        }
      }, 300);
    }
  }, [isOpen, stages]);

  const handleAddLead = (lead: any) => {
    if (selectedLeads.find(l => l.id === lead.id)) {
      toast.error("Este lead já foi adicionado");
      return;
    }

    // Tentar pegar company de várias fontes possíveis
    const companyName = lead.companies?.name || lead.company || lead.company_name || "";

    // Adicionar com role padrão "participant" - usuário pode mudar depois
    setSelectedLeads([...selectedLeads, {
      id: lead.id,
      name: `${lead.first_name} ${lead.last_name}`,
      company: companyName,
      job_title: lead.job_title,
      email: lead.email,
      role: 'participant' // Padrão, usuário muda com dropdown
    }]);
    setOpenLeadCombobox(false);
    setSearchLeadValue("");
  };

  const handleCreateNewLead = async () => {
    if (!newLeadFirstName.trim() || !newLeadLastName.trim()) {
      toast.error("Nome e sobrenome são obrigatórios");
      return;
    }

    try {
      console.log('📝 Criando novo lead inline:', {
        firstName: newLeadFirstName,
        lastName: newLeadLastName,
        email: newLeadEmail,
        linkToCompany: linkLeadToCompany,
        companyId: linkLeadToCompany ? companyId : null,
        companyName: linkLeadToCompany ? companyName : 'Sem vínculo'
      });

      // 1. Buscar o primeiro stage via pipeline do usuário
      const { data: userPipelines, error: pipelineError } = await supabase
        .from('pipelines')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (pipelineError || !userPipelines) {
        console.error('❌ Erro ao buscar pipeline:', pipelineError);
        toast.error('Erro: Nenhum pipeline encontrado. Configure um pipeline primeiro.');
        return;
      }

      // 2. Buscar primeiro stage deste pipeline
      const { data: userStages, error: stageError } = await supabase
        .from('stages')
        .select('id')
        .eq('pipeline_id', userPipelines.id)
        .order('position', { ascending: true })
        .limit(1)
        .single();

      if (stageError || !userStages) {
        console.error('❌ Erro ao buscar stage:', stageError);
        toast.error('Erro: Nenhum stage encontrado no pipeline.');
        return;
      }

      console.log('✅ Pipeline:', userPipelines.id, 'Stage:', userStages.id);

      // 3. Criar lead via Supabase (Schema completo com colunas adicionadas)
      const leadData: any = {
        user_id: userId,
        stage_id: userStages.id,
        first_name: newLeadFirstName.trim(),
        last_name: newLeadLastName.trim(),
        status: 'new',
        source: 'manual',
      };

      // Campos opcionais
      if (newLeadEmail.trim()) leadData.email = newLeadEmail.trim();
      if (newLeadPhone.trim()) leadData.phone = newLeadPhone.trim();
      if (newLeadJobTitle.trim()) leadData.job_title = newLeadJobTitle.trim();
      
      // Vincular à empresa se checkbox marcado
      if (linkLeadToCompany && companyId) {
        leadData.company_id = companyId;
        leadData.company = companyName; // Texto redundante mas útil para queries
      }

      console.log('📤 Dados do lead que serão enviados:', leadData);

      const { data: newLead, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar lead:', error);
        console.error('❌ Detalhes do erro:', JSON.stringify(error, null, 2));
        console.error('❌ Dados enviados:', leadData);
        toast.error('Erro ao criar contato. Verifique o console para detalhes.');
        throw error;
      }

      console.log('✅ Lead criado com sucesso:', newLead);

      // Adicionar lead recém-criado à lista de selecionados
      setSelectedLeads([...selectedLeads, {
        id: newLead.id,
        name: `${newLeadFirstName} ${newLeadLastName}`,
        company: companyName,
        job_title: newLeadJobTitle || '',
        email: newLeadEmail || '',
        role: 'participant'
      }]);

      // Limpar form e fechar dialog
      setIsCreatingNewLead(false);
      setNewLeadFirstName('');
      setNewLeadLastName('');
      setNewLeadEmail('');
      setNewLeadPhone('');
      setNewLeadJobTitle('');
      setLinkLeadToCompany(true); // Reset para padrão
      setSearchLeadValue('');

      toast.success(`Lead ${newLeadFirstName} ${newLeadLastName} criado e adicionado!`);
    } catch (error: any) {
      console.error('❌ Erro ao criar lead:', error);
      toast.error(`Erro ao criar lead: ${error.message}`);
    }
  };

  const handleRemoveLead = (leadId: string) => {
    setSelectedLeads(selectedLeads.filter(l => l.id !== leadId));
  };

  const handleChangeRole = (leadId: string, newRole: SelectedLead['role']) => {
    setSelectedLeads(selectedLeads.map(l => 
      l.id === leadId ? { ...l, role: newRole } : l
    ));
  };

  const validateBasicInfo = () => {
    if (!title.trim()) {
      toast.error("Nome da oportunidade é obrigatório");
      return false;
    }
    if (!value || parseFloat(value) <= 0) {
      toast.error("Valor da oportunidade é obrigatório e deve ser maior que zero");
      return false;
    }
    if (!companyName.trim()) {
      toast.error("Empresa é obrigatória");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateBasicInfo()) {
      setStep('participants');
    }
  };

  const handleCreateDeal = async () => {
    if (!validateBasicInfo()) return;

    if (selectedLeads.length === 0) {
      toast.error("Adicione pelo menos um contato à oportunidade");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Iniciando criação de oportunidade...', {
        companyName,
        companyId,
        hasCompanyId: !!companyId,
        selectedLeads: selectedLeads.map(l => ({ name: l.name, role: l.role }))
      });
      
      // 1. Criar empresa se for nova
      let finalCompanyId = companyId;
      
      if (!companyId && companyName.trim()) {
        console.log('🏢 Criando nova empresa:', companyName);
        try {
          const newCompany = await createCompany({
            user_id: userId,
            name: companyName.trim(),
          });
          finalCompanyId = newCompany.id;
          console.log('✅ Empresa criada:', newCompany.id, newCompany.name);
          toast.success(`Empresa "${companyName}" criada com sucesso!`);
        } catch (error: any) {
          console.error('❌ Erro ao criar empresa:', error);
          toast.error(`Erro ao criar empresa: ${error.message}`);
          // Continua sem empresa vinculada
        }
      }
      
      // 2. Criar o deal
      const newDeal = await createDealMutation.mutateAsync({
        user_id: userId,
        pipeline_id: pipelineId,
        stage_id: stageId,
        title: title.trim(),
        value: parseFloat(value),
        company_id: finalCompanyId || undefined, // ID da empresa existente ou recém-criada
        // company_name será removido após migration
        probability: parseInt(probability),
        expected_close_date: expectedCloseDate || undefined,
        description: description.trim() || undefined,
        // source: 'manual', // ❌ Coluna não existe no banco
        position: 0,
      });

      if (!newDeal || !newDeal.id) {
        throw new Error("Deal criado mas ID não foi retornado");
      }

      console.log('✅ Deal criado:', newDeal.id);

      // 2. Aguardar um pouco para garantir que o deal foi persistido
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Adicionar participantes
      console.log(`📝 Adicionando ${selectedLeads.length} participantes...`);
      
      for (let i = 0; i < selectedLeads.length; i++) {
        const lead = selectedLeads[i];
        try {
          await addParticipantMutation.mutateAsync({
            dealId: newDeal.id,
            leadId: lead.id,
            userId: userId,
            role: lead.role,
            isPrimary: i === 0,
          });
          console.log(`✅ Participante ${i + 1}/${selectedLeads.length} adicionado:`, lead.name);
        } catch (error: any) {
          console.error(`❌ Erro ao adicionar ${lead.name}:`, error);
          // Continua mesmo com erro em um participante
        }
      }

      toast.success(`🎉 Oportunidade "${title}" criada com ${selectedLeads.length} participante(s)!`);
      
      // Invalidar caches para garantir atualização da UI
      await queryClient.invalidateQueries({ queryKey: ["deals"] });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.invalidateQueries({ queryKey: ["analytics"] });
      
      // Aguardar um pouco antes de fechar para garantir que tudo foi salvo
      await new Promise(resolve => setTimeout(resolve, 500));
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar oportunidade:", error);
      toast.error(`Erro: ${error.message || 'Não foi possível criar a oportunidade'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role: SelectedLead['role']) => {
    const roles = {
      decision_maker: 'Decisor',
      influencer: 'Influenciador',
      user: 'Usuário',
      technical: 'Técnico',
      champion: 'Defensor',
      participant: 'Participante'
    };
    return roles[role];
  };

  const getRoleBadgeColor = (role: SelectedLead['role']) => {
    const colors = {
      decision_maker: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      influencer: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      user: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      technical: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      champion: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
      participant: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[role];
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 'basic' ? '🎯 Nova Oportunidade' : '👥 Adicionar Contatos'}
          </DialogTitle>
          <DialogDescription>
            {step === 'basic' 
              ? 'Preencha as informações básicas da oportunidade'
              : 'Adicione os contatos envolvidos nesta oportunidade'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'basic' && (
          <div className="space-y-4 py-4">
            {/* Título da Oportunidade */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <span className="text-red-500">*</span>
                Nome da Oportunidade
              </Label>
              <Input
                id="title"
                placeholder="Ex: Implementação de CRM na Empresa X"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="value" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-red-500">*</span>
                  Valor (R$)
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="text-red-500">*</span>
                    Empresa
                  </span>
                  {allCompanies.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {allCompanies.length} {allCompanies.length === 1 ? 'empresa' : 'empresas'} cadastradas
                    </span>
                  )}
                </Label>
                <Popover open={openCompanyCombobox} onOpenChange={setOpenCompanyCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {companyName || "Selecione ou digite uma empresa..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Digite o nome da empresa..." 
                        value={companyName}
                        onValueChange={(value) => {
                          setCompanyName(value);
                          setCompanyId(undefined); // Nova empresa, sem ID
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-4 text-center space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Nenhuma empresa encontrada com "{companyName}"
                            </p>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-2"
                              onClick={() => {
                                // Manter o nome digitado e fechar o popover
                                setOpenCompanyCombobox(false);
                                setCompanyId(undefined); // Nova empresa
                                toast.success(`✨ Nova empresa "${companyName}" será criada`);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              Criar nova empresa: "{companyName}"
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup heading="Empresas cadastradas">
                          {allCompanies.map((company: any) => (
                            <CommandItem
                              key={company.id}
                              value={company.name}
                              onSelect={() => {
                                setCompanyName(company.name);
                                setCompanyId(company.id);
                                setOpenCompanyCombobox(false);
                              }}
                            >
                              <Building2 className="mr-2 h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">{company.name}</span>
                                {company.domain && (
                                  <span className="text-xs text-muted-foreground">{company.domain}</span>
                                )}
                              </div>
                              <Check
                                className={`ml-auto h-4 w-4 ${
                                  companyId === company.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {companyName && (
                  <div className="flex items-center gap-2 text-xs">
                    {companyId ? (
                      <p className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Empresa existente selecionada: "{companyName}"
                      </p>
                    ) : (
                      <p className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        Nova empresa será criada: "{companyName}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Etapa */}
              <div className="space-y-2">
                <Label htmlFor="stage">Etapa Inicial</Label>
                <Select value={stageId} onValueChange={setStageId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Probabilidade */}
              <div className="space-y-2">
                <Label htmlFor="probability">Probabilidade (%)</Label>
                <Select value={probability} onValueChange={setProbability}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10% - Muito Baixa</SelectItem>
                    <SelectItem value="25">25% - Baixa</SelectItem>
                    <SelectItem value="50">50% - Média</SelectItem>
                    <SelectItem value="75">75% - Alta</SelectItem>
                    <SelectItem value="90">90% - Muito Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data Prevista */}
            <div className="space-y-2">
              <Label htmlFor="expectedDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data Prevista de Fechamento
              </Label>
              <Input
                id="expectedDate"
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição / Notas</Label>
              <Textarea
                id="description"
                placeholder="Detalhes sobre a oportunidade, requisitos, contexto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleNext}>
                Próximo: Adicionar Contatos
                <Users className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 'participants' && (
          <div className="space-y-4 py-4">
            {/* Buscar e Adicionar Lead */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-red-500">*</span>
                Buscar Contato
              </Label>
              
              <Popover open={openLeadCombobox} onOpenChange={setOpenLeadCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    Digite para buscar um contato...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Digite nome, empresa ou cargo..." 
                      value={searchLeadValue}
                      onValueChange={setSearchLeadValue}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-4 text-center space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Nenhum contato encontrado com "{searchLeadValue}"
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setIsCreatingNewLead(true);
                              setOpenLeadCombobox(false);
                              // Pre-preencher nome se usuário digitou
                              const names = searchLeadValue.split(' ');
                              if (names.length >= 2) {
                                setNewLeadFirstName(names[0]);
                                setNewLeadLastName(names.slice(1).join(' '));
                              } else {
                                setNewLeadFirstName(searchLeadValue);
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar novo contato "{searchLeadValue}"
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {allLeads
                          .filter(lead => !selectedLeads.find(sl => sl.id === lead.id))
                          .map((lead) => (
                            <CommandItem
                              key={lead.id}
                              value={`${lead.first_name} ${lead.last_name} ${lead.company || ""} ${lead.job_title || ""}`}
                              onSelect={() => handleAddLead(lead)}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(`${lead.first_name} ${lead.last_name}`)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1">
                                  <span className="font-medium">{lead.first_name} {lead.last_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {lead.job_title && `${lead.job_title} • `}
                                    {(lead as any).companies?.name || lead.company || "Sem empresa"}
                                  </span>
                                </div>
                                <Plus className="h-4 w-4" />
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Lista de Leads Selecionados */}
            <div className="space-y-2">
              <Label>Contatos Adicionados ({selectedLeads.length})</Label>
              
              {selectedLeads.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum contato adicionado ainda</p>
                  <p className="text-sm">Adicione pelo menos um contato para criar a oportunidade</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-2">
                  {selectedLeads.map((lead, index) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <Avatar>
                        <AvatarFallback className="text-sm">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lead.name}</span>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Principal
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lead.job_title && `${lead.job_title} • `}
                          {lead.company}
                        </div>
                      </div>

                      <Select 
                        value={lead.role} 
                        onValueChange={(value) => handleChangeRole(lead.id, value as SelectedLead['role'])}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="decision_maker">Decisor</SelectItem>
                          <SelectItem value="influencer">Influenciador</SelectItem>
                          <SelectItem value="champion">Defensor</SelectItem>
                          <SelectItem value="technical">Técnico</SelectItem>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="participant">Participante</SelectItem>
                        </SelectContent>
                      </Select>

                      <Badge className={getRoleBadgeColor(lead.role)}>
                        {getRoleLabel(lead.role)}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLead(lead.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('basic')}>
                Voltar
              </Button>
              <Button 
                onClick={handleCreateDeal} 
                disabled={isSubmitting || selectedLeads.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    Criar Oportunidade
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Dialog Criar Novo Lead Inline */}
    <Dialog open={isCreatingNewLead} onOpenChange={setIsCreatingNewLead}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Contato
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do novo contato. Após criar, ele será automaticamente adicionado à oportunidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="newLeadFirstName">
                <span className="text-red-500">*</span> Nome
              </Label>
              <Input
                id="newLeadFirstName"
                placeholder="João"
                value={newLeadFirstName}
                onChange={(e) => setNewLeadFirstName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newLeadLastName">
                <span className="text-red-500">*</span> Sobrenome
              </Label>
              <Input
                id="newLeadLastName"
                placeholder="Silva"
                value={newLeadLastName}
                onChange={(e) => setNewLeadLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="newLeadEmail">Email</Label>
            <Input
              id="newLeadEmail"
              type="email"
              placeholder="joao.silva@empresa.com"
              value={newLeadEmail}
              onChange={(e) => setNewLeadEmail(e.target.value)}
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="newLeadPhone">Telefone</Label>
            <Input
              id="newLeadPhone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={newLeadPhone}
              onChange={(e) => setNewLeadPhone(e.target.value)}
            />
          </div>

          {/* Cargo */}
          <div className="space-y-2">
            <Label htmlFor="newLeadJobTitle">Cargo</Label>
            <Input
              id="newLeadJobTitle"
              placeholder="Gerente de TI, Consultor, Freelancer..."
              value={newLeadJobTitle}
              onChange={(e) => setNewLeadJobTitle(e.target.value)}
            />
          </div>

          {/* Vínculo com Empresa (Opcional) */}
          {companyName ? (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="linkToCompany"
                  checked={linkLeadToCompany}
                  onCheckedChange={(checked) => setLinkLeadToCompany(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label 
                    htmlFor="linkToCompany" 
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    Vincular à empresa <strong>{companyName}</strong>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {linkLeadToCompany ? (
                      <>✅ Este contato será registrado como funcionário/representante da empresa</>
                    ) : (
                      <>⚠️ Contato será independente (consultor, freelancer, intermediário)</>
                    )}
                  </p>
                </div>
              </div>

              {/* Explicação contextual */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 text-xs space-y-1">
                <p className="flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-500" />
                  <span>
                    <strong>Quando vincular?</strong> Se o contato trabalha na empresa ({companyName})
                  </span>
                </p>
                <p className="flex items-start gap-2 ml-5">
                  <span>
                    <strong>Quando não vincular?</strong> Se é consultor independente, parceiro externo ou intermediário
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 text-xs">
              <p className="flex items-start gap-2 text-muted-foreground">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>
                  Nenhuma empresa selecionada na oportunidade. O contato será criado sem vínculo empresarial.
                </span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingNewLead(false);
                setNewLeadFirstName('');
                setNewLeadLastName('');
                setNewLeadEmail('');
                setNewLeadPhone('');
                setNewLeadJobTitle('');
                setLinkLeadToCompany(true); // Reset para padrão
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateNewLead}>
              <Plus className="h-4 w-4 mr-2" />
              Criar e Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

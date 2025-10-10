// =====================================================
// SNAPDOOR AI DIALOG - Smart Lead Discovery
// Interface para descoberta inteligente de leads usando IA SnapDoor
// =====================================================

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Sparkles, Target, TrendingUp, Settings, Brain, Zap } from 'lucide-react';
import { snapDoorAI, ProspectionFilters, ProspectionStatus } from '@/lib/snapDoorAI';
import { useStages } from '@/hooks/usePipelines';
import { useAuth } from '@/hooks/useAuth';

interface SnapDoorAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId?: string;
}

export function SnapDoorAIDialog({ open, onOpenChange, pipelineId }: SnapDoorAIDialogProps) {
  const { user } = useAuth();
  const { data: stages } = useStages(pipelineId);
  
  const [activeTab, setActiveTab] = useState('discover');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<ProspectionStatus | null>(null);
  
  const [filters, setFilters] = useState<ProspectionFilters>({
    industry: '',
    country: 'BR',
    city: '',
    companySizeMin: 10,
    companySizeMax: 500,
    keywords: []
  });
  
  const [selectedStage, setSelectedStage] = useState('');
  const [maxLeads, setMaxLeads] = useState(25);
  const [newKeyword, setNewKeyword] = useState('');

  // Carregar status ao abrir
  useEffect(() => {
    if (open) {
      loadStatus();
      if (stages?.length > 0 && !selectedStage) {
        setSelectedStage(stages[0].id);
      }
    }
  }, [open, stages]);

  const loadStatus = async () => {
    try {
      const currentStatus = await snapDoorAI.getSmartProspectionStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Failed to load SnapDoor AI status:', error);
    }
  };

  const handleRunAI = async () => {
    if (!selectedStage) {
      alert('Selecione um estágio de destino');
      return;
    }

    setIsRunning(true);
    setProgress(0);

    try {
      // Simular progresso da IA
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await snapDoorAI.runSmartProspection(filters, selectedStage, maxLeads);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        setTimeout(() => {
          setProgress(0);
          setIsRunning(false);
          loadStatus();
          onOpenChange(false);
        }, 1000);
      } else {
        setProgress(0);
        setIsRunning(false);
      }

    } catch (error) {
      console.error('SnapDoor AI failed:', error);
      setProgress(0);
      setIsRunning(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !filters.keywords?.includes(newKeyword.trim())) {
      setFilters(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFilters(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const getIndustryOptions = () => [
    { value: 'technology', label: '💻 Tecnologia' },
    { value: 'finance', label: '💰 Financeiro' },
    { value: 'healthcare', label: '🏥 Saúde' },
    { value: 'education', label: '🎓 Educação' },
    { value: 'retail', label: '🛍️ Varejo' },
    { value: 'manufacturing', label: '🏭 Indústria' },
    { value: 'consulting', label: '📊 Consultoria' },
    { value: 'marketing', label: '📈 Marketing' },
    { value: 'real-estate', label: '🏢 Imobiliário' },
    { value: 'automotive', label: '🚗 Automotivo' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            SnapDoor AI - Descoberta Inteligente
          </DialogTitle>
          <DialogDescription>
            Nossa inteligência artificial descobre e enriquece leads automaticamente para seu pipeline.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Descoberta
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análise IA
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Status Overview */}
            {status && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    Status da IA SnapDoor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{status.totalLeadsCreated}</div>
                      <div className="text-xs text-muted-foreground">Leads Descobertos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{status.totalLeadsEnriched}</div>
                      <div className="text-xs text-muted-foreground">IA Enriquecidos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{status.creditsRemaining}</div>
                      <div className="text-xs text-muted-foreground">Créditos IA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Última IA Execução</div>
                      <div className="text-sm">
                        {status.lastRun ? new Date(status.lastRun).toLocaleDateString('pt-BR') : 'Nunca'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configuração da IA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Configurar IA SnapDoor
                </CardTitle>
                <CardDescription>
                  Defina os parâmetros para que nossa IA encontre leads ideais para seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Setor Alvo</Label>
                    <Select 
                      value={filters.industry} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="IA irá analisar este setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {getIndustryOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Localização</Label>
                    <Input
                      id="city"
                      placeholder="Ex: São Paulo, Rio de Janeiro"
                      value={filters.city}
                      onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tamanho da Empresa (funcionários)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.companySizeMin}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          companySizeMin: parseInt(e.target.value) || 1 
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.companySizeMax}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          companySizeMax: parseInt(e.target.value) || 1000 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage">Estágio de Destino</Label>
                    <Select value={selectedStage} onValueChange={setSelectedStage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Onde a IA adicionará os leads" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages?.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Palavras-chave para IA</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="IA irá procurar por estas palavras"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    />
                    <Button onClick={handleAddKeyword} variant="outline" size="sm">
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.keywords?.map(keyword => (
                      <Badge 
                        key={keyword} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLeads">Máximo de Leads IA: {maxLeads}</Label>
                  <Input
                    id="maxLeads"
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={maxLeads}
                    onChange={(e) => setMaxLeads(parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <div className="text-xs text-muted-foreground">
                    Créditos IA estimados: {maxLeads * 2}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progresso da IA */}
            {isRunning && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <Brain className="h-4 w-4 text-purple-600" />
                    IA SnapDoor Trabalhando...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="w-full" />
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    {progress < 30 && "IA analisando mercado..."}
                    {progress >= 30 && progress < 70 && "IA descobrindo leads..."}
                    {progress >= 70 && progress < 100 && "IA enriquecendo dados..."}
                    {progress === 100 && "IA concluída!"}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <Sparkles className="h-4 w-4 text-purple-600" />
                IA SnapDoor irá descobrir e enriquecer automaticamente
              </div>
              
              <div className="space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleRunAI} 
                  disabled={isRunning || !selectedStage}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      IA Executando...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      <Zap className="h-3 w-3 mr-1" />
                      Ativar IA SnapDoor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Análise de Performance IA
                </CardTitle>
                <CardDescription>
                  Estatísticas e métricas do desempenho da IA SnapDoor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50 text-purple-400" />
                  <p>Análise detalhada da performance da IA</p>
                  <p className="text-sm">será exibida aqui após executar a IA SnapDoor</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  Configurações Avançadas da IA
                </CardTitle>
                <CardDescription>
                  Configure automação e preferências da IA SnapDoor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50 text-purple-400" />
                  <p>Configurações automáticas da IA</p>
                  <p className="text-sm">serão implementadas em versões futuras</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
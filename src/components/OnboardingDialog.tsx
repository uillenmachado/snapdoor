import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Check } from "lucide-react";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  // Step 1: Sobre você
  const [fullName, setFullName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [usedCrmBefore, setUsedCrmBefore] = useState("");
  const [phone, setPhone] = useState("");
  
  // Step 2: Sua empresa
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  
  // Step 3: Suas metas
  const [goals, setGoals] = useState<string[]>([]);
  
  const progress = (step / totalSteps) * 100;
  
  const availableGoals = [
    { id: "organize_sales", label: "Organizar meu processo de vendas" },
    { id: "increase_conversion", label: "Aumentar taxa de conversão" },
    { id: "track_performance", label: "Acompanhar performance da equipe" },
    { id: "collaborate_team", label: "Colaborar melhor com o time" },
    { id: "get_more_leads", label: "Obter mais leads" },
  ];
  
  const handleGoalToggle = (goalId: string) => {
    setGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleComplete = async () => {
    if (!user?.id) return;
    
    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        updates: {
          full_name: fullName,
          job_role: jobRole,
          company_size: companySize,
          industry: industry,
          goals: goals,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        },
      });
      
      toast.success("Bem-vindo ao SnapDoor CRM! 🎉");
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar onboarding:", error);
      toast.error("Erro ao salvar suas informações. Tente novamente.");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <div className="h-px w-16 bg-border" />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > 2 ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <div className="h-px w-16 bg-border" />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <DialogTitle className="text-2xl mt-6">
            {step === 1 && "Sobre você"}
            {step === 2 && "Sobre a sua empresa"}
            {step === 3 && "Suas metas"}
          </DialogTitle>
          
          <DialogDescription>
            {step === 1 && "Vamos conhecer você melhor para personalizar sua experiência."}
            {step === 2 && "Essas informações nos ajudam a adaptar o CRM às suas necessidades."}
            {step === 3 && "Em que gostaríamos de ajudá-lo a se concentrar?"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Step 1: Sobre você */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Seu nome completo</Label>
                <Input
                  id="fullName"
                  placeholder="João Silva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobRole">Qual é o seu cargo ou função?</Label>
                <Select value={jobRole} onValueChange={setJobRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_rep">Representante de Vendas</SelectItem>
                    <SelectItem value="sales_manager">Gerente de Vendas</SelectItem>
                    <SelectItem value="sales_director">Diretor de Vendas</SelectItem>
                    <SelectItem value="business_owner">Dono do Negócio</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usedCrm">Já usou um CRM antes?</Label>
                <Select value={usedCrmBefore} onValueChange={setUsedCrmBefore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Sim, já usei um CRM</SelectItem>
                    <SelectItem value="no">Não, esta é minha primeira vez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}
          
          {/* Step 2: Sua empresa */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companySize">Qual o tamanho da sua empresa?</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Apenas eu (1 pessoa)</SelectItem>
                    <SelectItem value="2-5">2-5 pessoas</SelectItem>
                    <SelectItem value="6-10">6-10 pessoas</SelectItem>
                    <SelectItem value="11-50">11-50 pessoas</SelectItem>
                    <SelectItem value="50+">50+ pessoas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Setor / Indústria</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Tecnologia</SelectItem>
                    <SelectItem value="consulting">Consultoria e Agências</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="healthcare">Saúde</SelectItem>
                    <SelectItem value="finance">Finanças</SelectItem>
                    <SelectItem value="real_estate">Imóveis</SelectItem>
                    <SelectItem value="manufacturing">Manufatura</SelectItem>
                    <SelectItem value="services">Serviços</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {/* Step 3: Suas metas */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione todas as opções que se aplicam:
              </p>
              
              {availableGoals.map((goal) => (
                <div key={goal.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
                  <Checkbox
                    id={goal.id}
                    checked={goals.includes(goal.id)}
                    onCheckedChange={() => handleGoalToggle(goal.id)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={goal.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {goal.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-4 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
          ) : (
            <div />
          )}
          
          {step < totalSteps ? (
            <Button onClick={handleNext} disabled={
              (step === 1 && !fullName) ||
              (step === 2 && (!companyName || !companySize || !industry))
            }>
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={goals.length === 0 || updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Salvando..." : "Criar minha conta"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

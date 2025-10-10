import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { useCreateLead } from "@/hooks/useLeads";
import { Stage } from "@/hooks/usePipelines";

interface AddLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stages: Stage[];
  userId: string | undefined;
}

export function AddLeadDialog({ isOpen, onClose, stages, userId }: AddLeadDialogProps) {
  const createLeadMutation = useCreateLead();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    company: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    stage: "",
    source: "manual" as "manual" | "snapdoor-ai" | "import",
  });
  const [emailError, setEmailError] = useState("");

  // Email validation
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("");
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email inválido");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Update default stage when stages change
  useEffect(() => {
    if (stages && stages.length > 0 && !formData.stage) {
      setFormData((prev) => ({ ...prev, stage: stages[0].id }));
    }
  }, [stages, formData.stage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.company) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (!userId) {
      toast.error("Usuário não autenticado");
      return;
    }

    await createLeadMutation.mutateAsync({
      stage_id: formData.stage,
      user_id: userId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      job_title: formData.jobTitle || undefined,
      company: formData.company || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      linkedin_url: formData.linkedinUrl || undefined,
    });
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      jobTitle: "",
      company: "",
      email: "",
      phone: "",
      linkedinUrl: "",
      stage: stages[0]?.id || "",
      source: "manual",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
          <DialogDescription>
            Preencha as informações do lead capturado do LinkedIn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Cargo</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) =>
                setFormData({ ...formData, jobTitle: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, email: value });
                validateEmail(value);
              }}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
            {formData.email && !emailError && (
              <p className="text-xs text-green-500 mt-1">✓ Email válido</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">URL do LinkedIn</Label>
            <Input
              id="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkedinUrl: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Fonte do Lead</Label>
            <Select
              value={formData.source}
              onValueChange={(value: any) =>
                setFormData({ ...formData, source: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="snapdoor-ai">SnapDoor AI</SelectItem>
                <SelectItem value="import">Importação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Etapa Inicial</Label>
            <Select
              value={formData.stage}
              onValueChange={(value) =>
                setFormData({ ...formData, stage: value })
              }
            >
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

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Adicionar Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

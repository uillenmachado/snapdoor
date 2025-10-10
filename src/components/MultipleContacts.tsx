// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Star, Mail, Phone, Check } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  type: "email" | "phone";
  value: string;
  label?: string;
  is_primary: boolean;
  is_verified: boolean;
  notes?: string;
}

interface MultipleContactsProps {
  leadId: string;
  type: "email" | "phone";
  icon: React.ReactNode;
  title: string;
}

export function MultipleContacts({ leadId, type, icon, title }: MultipleContactsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");

  // Buscar contatos
  const { data: contacts = [] } = useQuery({
    queryKey: ["lead-contacts", leadId, type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_contacts")
        .select("*")
        .eq("lead_id", leadId)
        .eq("type", type)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Contact[];
    },
  });

  // Adicionar contato
  const addContactMutation = useMutation({
    mutationFn: async (data: { value: string; label?: string }) => {
      const { error } = await supabase.from("lead_contacts").insert({
        lead_id: leadId,
        user_id: user?.id,
        type,
        value: data.value,
        label: data.label || null,
        is_primary: contacts.length === 0, // Primeiro é primary
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-contacts", leadId, type] });
      toast.success(`${type === "email" ? "Email" : "Telefone"} adicionado!`);
      setNewValue("");
      setNewLabel("");
      setIsAdding(false);
    },
    onError: (error) => {
      console.error("Erro ao adicionar contato:", error);
      toast.error("Erro ao adicionar contato");
    },
  });

  // Marcar como primary
  const setPrimaryMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("lead_contacts")
        .update({ is_primary: true })
        .eq("id", contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-contacts", leadId, type] });
      toast.success("Contato preferencial atualizado!");
    },
  });

  // Deletar contato
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("lead_contacts")
        .delete()
        .eq("id", contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-contacts", leadId, type] });
      toast.success("Contato removido!");
    },
  });

  const handleAdd = () => {
    if (!newValue.trim()) {
      toast.error("Digite um valor válido");
      return;
    }

    addContactMutation.mutate({
      value: newValue.trim(),
      label: newLabel.trim() || undefined,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {!isAdding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Lista de contatos */}
      <div className="space-y-2">
        {contacts.map((contact) => (
          <Card key={contact.id} className="border">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{contact.value}</span>
                    {contact.is_primary && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                        Preferencial
                      </Badge>
                    )}
                    {contact.is_verified && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-green-100 text-green-700">
                        <Check className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                  {contact.label && (
                    <span className="text-xs text-muted-foreground">{contact.label}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {!contact.is_primary && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setPrimaryMutation.mutate(contact.id)}
                      title="Marcar como preferencial"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteContactMutation.mutate(contact.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário de adicionar */}
      {isAdding && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`new-${type}-value`} className="text-xs">
                {type === "email" ? "Email" : "Telefone"}
              </Label>
              <Input
                id={`new-${type}-value`}
                type={type === "email" ? "email" : "tel"}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={
                  type === "email" ? "exemplo@empresa.com" : "(11) 99999-9999"
                }
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`new-${type}-label`} className="text-xs">
                Rótulo (opcional)
              </Label>
              <Select value={newLabel} onValueChange={setNewLabel}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione ou deixe em branco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trabalho">Trabalho</SelectItem>
                  <SelectItem value="Pessoal">Pessoal</SelectItem>
                  {type === "phone" && (
                    <>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Celular">Celular</SelectItem>
                      <SelectItem value="Fixo">Fixo</SelectItem>
                    </>
                  )}
                  {type === "email" && (
                    <>
                      <SelectItem value="Principal">Principal</SelectItem>
                      <SelectItem value="Alternativo">Alternativo</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={addContactMutation.isPending}
                className="flex-1 h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Adicionar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewValue("");
                  setNewLabel("");
                }}
                className="h-8"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {contacts.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground italic text-center py-2">
          Nenhum {type === "email" ? "email" : "telefone"} cadastrado
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditableFieldProps {
  leadId: string;
  fieldName: string;
  value: string | null | undefined;
  label: string;
  icon?: React.ReactNode;
  type?: "text" | "email" | "tel" | "url" | "textarea";
  onUpdate?: () => void;
}

export function EditableField({
  leadId,
  fieldName,
  value,
  label,
  icon,
  type = "text",
  onUpdate,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ [fieldName]: editValue || null })
        .eq("id", leadId);

      if (error) throw error;

      toast.success(`${label} atualizado com sucesso!`);
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Erro ao atualizar campo:", error);
      toast.error(`Erro ao atualizar ${label}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-2">{icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          {type === "textarea" ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={4}
              className="w-full"
            />
          ) : (
            <Input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full"
            />
          )}
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Salvar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className={`text-sm ${value ? "" : "text-muted-foreground italic"}`}>
          {value || "Não informado"}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="w-3 h-3" />
      </Button>
    </div>
  );
}

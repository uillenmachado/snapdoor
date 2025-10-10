import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Fetch notes for a lead
export const useNotes = (leadId: string | undefined) => {
  return useQuery({
    queryKey: ["notes", leadId],
    queryFn: async () => {
      if (!leadId) throw new Error("Lead ID required");

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!leadId,
  });
};

// Create a note
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNote: {
      lead_id: string;
      user_id: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("notes")
        .insert(newNote)
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes", data.lead_id] });
      toast.success("Nota adicionada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar nota: ${error.message}`);
    },
  });
};

// Update a note
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      leadId,
      content,
    }: {
      id: string;
      leadId: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("notes")
        .update({ content })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes", data.lead_id] });
      toast.success("Nota atualizada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar nota: ${error.message}`);
    },
  });
};

// Delete a note
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, leadId }: { id: string; leadId: string }) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;
      return { id, leadId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes", data.leadId] });
      toast.success("Nota excluída!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir nota: ${error.message}`);
    },
  });
};


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FichaCompartilhada {
  id: string;
  id_aluna: number;
  token: string;
  expires_at: string;
  user_id: string;
  created_at: string;
}

export const useCreateFichaCompartilhada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ idAluna, expiresInHours }: { idAluna: number; expiresInHours: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Generate random token
      const token = crypto.randomUUID();
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const { data, error } = await supabase
        .from("fichas_compartilhadas")
        .insert([{
          id_aluna: idAluna,
          token,
          expires_at: expiresAt.toISOString(),
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as FichaCompartilhada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fichas_compartilhadas"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar link de compartilhamento");
    },
  });
};

export const useDeleteFichaCompartilhada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fichas_compartilhadas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fichas_compartilhadas"] });
      toast.success("Link de compartilhamento removido!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover link");
    },
  });
};

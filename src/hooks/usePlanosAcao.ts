import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PlanoAcao } from "./useAlunas";

export const useCreatePlanoAcao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plano: Omit<Partial<PlanoAcao>, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id_aluna: number; objetivo: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("planos_acao")
        .insert([{ ...plano, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos_acao"] });
      toast.success("Plano de ação criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar plano de ação");
    },
  });
};

export const useUpdatePlanoAcao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...plano }: Partial<PlanoAcao> & { id: number }) => {
      const { data, error } = await supabase
        .from("planos_acao")
        .update(plano)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos_acao"] });
      toast.success("Plano de ação atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar plano de ação");
    },
  });
};

export const useDeletePlanoAcao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("planos_acao").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos_acao"] });
      toast.success("Plano de ação removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover plano de ação");
    },
  });
};

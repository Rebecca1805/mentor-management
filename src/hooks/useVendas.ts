import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Venda } from "./useAlunas";

export const useCreateVenda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venda: Omit<Partial<Venda>, 'id' | 'user_id' | 'created_at'> & { id_aluna: number; periodo: string; valor_vendido: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("vendas")
        .insert([{ ...venda, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendas"] });
      toast.success("Venda registrada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao registrar venda");
    },
  });
};

export const useUpdateVenda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...venda }: Partial<Venda> & { id: number }) => {
      const { data, error } = await supabase
        .from("vendas")
        .update(venda)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendas"] });
      toast.success("Venda atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar venda");
    },
  });
};

export const useDeleteVenda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("vendas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendas"] });
      toast.success("Venda removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover venda");
    },
  });
};

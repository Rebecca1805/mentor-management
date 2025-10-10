import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showSuccessToast, showErrorToast } from "@/lib/toastHelpers";

export interface ObservacaoMentora {
  id: string;
  id_aluna: number;
  plano_acao: string;
  prazo_execucao: string | null;
  status: 'iniciado' | 'em_andamento' | 'cancelado' | 'interrompido';
  observacoes: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useObservacoesMentora = (idAluna?: number) => {
  return useQuery({
    queryKey: idAluna ? ["observacoes_mentora", idAluna] : ["observacoes_mentora"],
    queryFn: async () => {
      let query = supabase
        .from("observacoes_mentora")
        .select("*")
        .order("prazo_execucao", { ascending: true, nullsFirst: false })
        .order("status", { ascending: true });

      if (idAluna) {
        query = query.eq("id_aluna", idAluna);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ObservacaoMentora[];
    },
    enabled: idAluna !== undefined,
  });
};

export const useCreateObservacaoMentora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (observacao: Omit<ObservacaoMentora, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("observacoes_mentora")
        .insert([{ ...observacao, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["observacoes_mentora"] });
      showSuccessToast("Observação adicionada!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao adicionar observação");
    },
  });
};

export const useUpdateObservacaoMentora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...observacao }: Partial<ObservacaoMentora> & { id: string }) => {
      const { data, error } = await supabase
        .from("observacoes_mentora")
        .update(observacao)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["observacoes_mentora"] });
      showSuccessToast("Observação atualizada!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao atualizar observação");
    },
  });
};

export const useDeleteObservacaoMentora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("observacoes_mentora")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["observacoes_mentora"] });
      showSuccessToast("Observação removida!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao remover observação");
    },
  });
};

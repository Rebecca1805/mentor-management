import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CursoAdquirido {
  nome: string;
  status: 'nao_iniciado' | 'em_andamento' | 'pausado' | 'concluido';
}

// ObservacaoMentora moved to useObservacoesMentora.ts

export interface Aluna {
  id: number;
  nome: string;
  email: string;
  curso_atual: string | null;
  cursos_adquiridos: CursoAdquirido[];
  data_cadastro: string;
  data_primeira_compra: string | null;
  data_ultima_compra: string | null;
  tempo_base: number;
  status: string;
  principais_dificuldades: string[];
  observacoes_mentora: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Helper function to calculate cursos_concluidos
export const getCursosConcluidos = (aluna: Aluna): number => {
  return aluna.cursos_adquiridos.filter(c => c.status === 'concluido').length;
};

export interface PlanoAcao {
  id: number;
  id_aluna: number;
  objetivo: string;
  resultado_esperado: string | null;
  etapas: string[];
  etapas_concluidas: string[];
  data_inicio: string | null;
  data_fim_prevista: string | null;
  data_fim_real: string | null;
  resultados_obtidos: string | null;
  user_id: string;
}

export interface Venda {
  id: number;
  id_aluna: number;
  periodo: string;
  valor_vendido: number;
  produtos: string[];
  observacoes: string | null;
  user_id: string;
}

export const useAlunas = () => {
  return useQuery({
    queryKey: ["alunas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunas")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data.map((aluna: any) => ({
        ...aluna,
        cursos_adquiridos: (aluna.cursos_adquiridos as any[])?.map((c: any) => ({
          nome: c.nome || '',
          status: c.status || 'nao_iniciado'
        })) || [],
        principais_dificuldades: Array.isArray(aluna.principais_dificuldades)
          ? aluna.principais_dificuldades
          : [],
      })) as Aluna[];
    },
  });
};

export const useAluna = (id?: number) => {
  return useQuery({
    queryKey: ["aluna", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("alunas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return {
        ...data,
        cursos_adquiridos: (data.cursos_adquiridos as any[])?.map((c: any) => ({
          nome: c.nome || '',
          status: c.status || 'nao_iniciado'
        })) || [],
        principais_dificuldades: Array.isArray(data.principais_dificuldades)
          ? data.principais_dificuldades
          : [],
      } as Aluna;
    },
    enabled: !!id,
  });
};

export const usePlanosAcao = (idAluna: number) => {
  return useQuery({
    queryKey: ["planos_acao", idAluna],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos_acao")
        .select("*")
        .eq("id_aluna", idAluna)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PlanoAcao[];
    },
    enabled: !!idAluna,
  });
};

export const useVendas = (idAluna?: number) => {
  return useQuery({
    queryKey: idAluna ? ["vendas", idAluna] : ["vendas"],
    queryFn: async () => {
      let query = supabase.from("vendas").select("*");
      
      if (idAluna) {
        query = query.eq("id_aluna", idAluna);
      }

      const { data, error } = await query.order("periodo", { ascending: false });

      if (error) throw error;
      return data as Venda[];
    },
  });
};

export const useCreateAluna = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aluna: Omit<Partial<Aluna>, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { nome: string; email: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const insertData: any = { ...aluna, user_id: user.id };
      
      const { data, error } = await supabase
        .from("alunas")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunas"] });
      toast.success("Aluna adicionada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar aluna");
    },
  });
};

export const useUpdateAluna = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...aluna }: Partial<Aluna> & { id: number }) => {
      const updateData: any = { ...aluna };
      
      const { data, error } = await supabase
        .from("alunas")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunas"] });
      queryClient.invalidateQueries({ queryKey: ["aluna"] });
      toast.success("Aluna atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar aluna");
    },
  });
};

export const useDeleteAluna = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("alunas").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alunas"] });
      toast.success("Aluna removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover aluna");
    },
  });
};

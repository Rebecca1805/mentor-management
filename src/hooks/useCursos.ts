import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showSuccessToast, showErrorToast } from "@/lib/toastHelpers";

export interface Curso {
  id: number;
  nome: string;
  descricao: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CursoVersao {
  id: number;
  id_curso: number;
  versao: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AlunoCurso {
  id: number;
  id_aluna: number;
  id_curso: number;
  id_versao: number | null;
  status_evolucao: 'nao_iniciado' | 'em_andamento' | 'pausado' | 'concluido';
  data_compra: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useCursos = () => {
  return useQuery({
    queryKey: ["cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cursos")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as Curso[];
    },
  });
};

export const useCursoVersoes = (idCurso?: number) => {
  return useQuery({
    queryKey: ["curso_versoes", idCurso],
    queryFn: async () => {
      let query = supabase
        .from("curso_versoes")
        .select("*")
        .order("data_inicio_vigencia", { ascending: false });

      if (idCurso) {
        query = query.eq("id_curso", idCurso);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CursoVersao[];
    },
    enabled: idCurso !== undefined,
  });
};

export const useAlunoCursos = (idAluna?: number) => {
  return useQuery({
    queryKey: ["aluno_cursos", idAluna],
    queryFn: async () => {
      if (!idAluna) return [];

      const { data, error } = await supabase
        .from("aluno_cursos")
        .select(`
          *,
          cursos:id_curso(*),
          curso_versoes:id_versao(*)
        `)
        .eq("id_aluna", idAluna);

      if (error) throw error;
      return data;
    },
    enabled: !!idAluna,
  });
};

export const useCreateCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (curso: Omit<Curso, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("cursos")
        .insert([{ ...curso, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      showSuccessToast("Curso criado com sucesso!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao criar curso");
    },
  });
};

export const useUpdateCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...curso }: Partial<Curso> & { id: number }) => {
      const { data, error } = await supabase
        .from("cursos")
        .update(curso)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      showSuccessToast("Curso atualizado com sucesso!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao atualizar curso");
    },
  });
};

export const useDeleteCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("cursos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      showSuccessToast("Curso removido com sucesso!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao remover curso");
    },
  });
};

export const useCreateCursoVersao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (versao: Omit<CursoVersao, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("curso_versoes")
        .insert([{ ...versao, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curso_versoes"] });
      showSuccessToast("Versão criada com sucesso!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao criar versão");
    },
  });
};

export const useUpdateCursoVersao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...versao }: Partial<CursoVersao> & { id: number }) => {
      const { data, error } = await supabase
        .from("curso_versoes")
        .update(versao)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curso_versoes"] });
      showSuccessToast("Versão atualizada com sucesso!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao atualizar versão");
    },
  });
};

export const useDeleteCursoVersao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("curso_versoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curso_versoes"] });
      showSuccessToast("Versão removida com sucesso!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao remover versão");
    },
  });
};

export const useCreateAlunoCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alunoCurso: Omit<AlunoCurso, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("aluno_cursos")
        .insert([{ ...alunoCurso, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aluno_cursos"] });
      showSuccessToast("Curso adicionado ao aluno!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao adicionar curso");
    },
  });
};

export const useUpdateAlunoCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...alunoCurso }: Partial<AlunoCurso> & { id: number }) => {
      console.log("Atualizando aluno_curso:", { id, ...alunoCurso });
      
      const { data, error } = await supabase
        .from("aluno_cursos")
        .update(alunoCurso)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro no update aluno_cursos:", error);
        throw error;
      }
      
      console.log("Aluno_curso atualizado com sucesso:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log("onSuccess - invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["aluno_cursos"] });
      
      // Mensagem mais específica baseada no que foi atualizado
      if (variables.status_evolucao) {
        showSuccessToast("Status do curso atualizado!");
      } else if (variables.data_compra) {
        showSuccessToast("Data de contratação atualizada!");
      } else {
        showSuccessToast("Curso atualizado!");
      }
    },
    onError: (error: any) => {
      console.error("onError mutation:", error);
      showErrorToast(error.message || "Erro ao atualizar curso");
    },
  });
};

export const useDeleteAlunoCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("aluno_cursos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aluno_cursos"] });
      showSuccessToast("Curso removido do aluno!");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Erro ao remover curso");
    },
  });
};

// Função auxiliar para sugerir versão vigente baseada na data de cadastro
export const getVersaoVigenteParaData = (versoes: CursoVersao[], dataCadastro: string): CursoVersao | null => {
  const data = new Date(dataCadastro);
  
  return versoes.find(v => {
    const inicio = new Date(v.data_inicio_vigencia);
    const fim = v.data_fim_vigencia ? new Date(v.data_fim_vigencia) : null;
    
    return data >= inicio && (!fim || data <= fim);
  }) || null;
};

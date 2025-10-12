import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MentorStats {
  alunosAtivos: number;
  alunosInativos: number;
  totalAlunos: number;
  totalCursos: number;
  vendasMes: number;
  vendasTotal: number;
}

export function useMentorStats() {
  return useQuery({
    queryKey: ["mentor-stats"],
    queryFn: async (): Promise<MentorStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Buscar alunos ativos e inativos
      const { data: alunas, error: alunasError } = await supabase
        .from("alunas")
        .select("status")
        .eq("user_id", user.id);

      if (alunasError) throw alunasError;

      const alunosAtivos = alunas?.filter(a => a.status === "Ativo").length || 0;
      const alunosInativos = alunas?.filter(a => a.status === "Inativo").length || 0;
      const totalAlunos = alunas?.length || 0;

      // Buscar total de cursos cadastrados
      const { count: totalCursos, error: cursosError } = await supabase
        .from("cursos")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (cursosError) throw cursosError;

      // Buscar vendas do mês atual
      const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: vendasMesData, error: vendasMesError } = await supabase
        .from("vendas")
        .select("valor_vendido")
        .eq("user_id", user.id)
        .like("periodo", `${mesAtual}%`);

      if (vendasMesError) throw vendasMesError;

      const vendasMes = vendasMesData?.reduce((acc, v) => acc + Number(v.valor_vendido), 0) || 0;

      // Buscar total de vendas
      const { data: vendasTotalData, error: vendasTotalError } = await supabase
        .from("vendas")
        .select("valor_vendido")
        .eq("user_id", user.id);

      if (vendasTotalError) throw vendasTotalError;

      const vendasTotal = vendasTotalData?.reduce((acc, v) => acc + Number(v.valor_vendido), 0) || 0;

      return {
        alunosAtivos,
        alunosInativos,
        totalAlunos,
        totalCursos: totalCursos || 0,
        vendasMes,
        vendasTotal,
      };
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

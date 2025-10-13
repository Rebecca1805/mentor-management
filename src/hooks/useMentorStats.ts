import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MentorStats {
  alunosAtivos: number;
  alunosInativos: number;
  totalAlunos: number;
  totalCursos: number;
  vendasMes: number;
  vendasTotal: number;
}

export function useMentorStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["mentor-stats", user?.id],
    queryFn: async (): Promise<MentorStats> => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .rpc('get_mentor_stats', { p_user_id: user.id });

      if (error) throw error;
      
      // Parse o JSON retornado
      const stats = typeof data === 'string' ? JSON.parse(data) : data;
      
      return {
        alunosAtivos: Number(stats.alunosAtivos) || 0,
        alunosInativos: Number(stats.alunosInativos) || 0,
        totalAlunos: Number(stats.totalAlunos) || 0,
        totalCursos: Number(stats.totalCursos) || 0,
        vendasMes: Number(stats.vendasMes) || 0,
        vendasTotal: Number(stats.vendasTotal) || 0,
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 60 * 1000,
    refetchOnMount: false,
  });
}

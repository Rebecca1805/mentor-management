import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Usuario {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  role: "admin" | "mentor" | "aluno" | string;
  status: "pendente" | "ativa" | "inativa" | "suspensa";
  approved_at: string | null;
  approved_by: string | null;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["usuario", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar usuário:", error.message);
        throw error;
      }

      if (!data) {
        console.warn("Nenhum registro encontrado na tabela 'usuarios' para o user_id:", user.id);
      }

      return data as Usuario | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useAllUsuarios() {
  return useQuery({
    queryKey: ["todos-usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar lista de usuários:", error.message);
        throw error;
      }

      return data as Usuario[];
    },
    stale

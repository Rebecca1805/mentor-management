import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  status: 'pendente' | 'ativa' | 'inativa' | 'suspensa';
  approved_at: string | null;
  approved_by: string | null;
  subscription_plan: string;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      status, 
      approvedBy,
      subscriptionPlan,
      subscriptionExpiresAt
    }: { 
      userId: string; 
      status: Profile['status'];
      approvedBy?: string;
      subscriptionPlan?: string;
      subscriptionExpiresAt?: string;
    }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'ativa' && !updateData.approved_at) {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = approvedBy;
      }
      
      // Permitir atualizar plano e expiração independentemente do status
      if (subscriptionPlan) {
        updateData.subscription_plan = subscriptionPlan;
      }
      if (subscriptionExpiresAt) {
        updateData.subscription_expires_at = subscriptionExpiresAt;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });
}

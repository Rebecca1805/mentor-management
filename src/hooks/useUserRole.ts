import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserRole() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return { isAdmin: false, isLoading: false };

      const { data, error } = await supabase
        .rpc('is_admin');

      if (error) {
        console.error("Error checking admin status:", error);
        return { isAdmin: false, isLoading: false };
      }

      return { isAdmin: data === true, isLoading: false };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false,
  });
}

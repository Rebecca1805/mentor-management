import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  return useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, isLoading: false };

      const { data, error } = await supabase
        .rpc('is_admin');

      if (error) {
        console.error("Error checking admin status:", error);
        return { isAdmin: false, isLoading: false };
      }

      return { isAdmin: data === true, isLoading: false };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

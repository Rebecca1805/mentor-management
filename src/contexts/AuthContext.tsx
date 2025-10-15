import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      console.log("🔹 Verificando sessão ativa...");
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao obter sessão:", error.message);
        setUser(null);
        setLoading(false);
        return;
      }

      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);

      console.log("🔹 Usuário inicial:", sessionUser);
    };

    initAuth();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🌀 Evento de auth:", event);
      const newUser = session?.user ?? null;

      setUser(newUser);
      setLoading(false);

      // Limpa cache se o user mudou
      queryClient.invalidateQueries();

      // Se o usuário deslogar, leva pra login
      if (event === "SIGNED_OUT" || !newUser) {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

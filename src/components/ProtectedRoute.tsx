import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requiresAdmin = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: roleData, isLoading: roleLoading } = useUserRole();

  if (authLoading || profileLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se precisa ser admin
  if (requiresAdmin && !roleData?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se for admin, não precisa verificar status do perfil
  if (roleData?.isAdmin) {
    return <>{children}</>;
  }

  // Verificar se a mentora está pendente de aprovação
  if (profile && profile.status === 'pendente') {
    return <Navigate to="/aguardando-aprovacao" replace />;
  }

  // Verificar se a mentora foi suspensa ou inativada
  if (profile && (profile.status === 'suspensa' || profile.status === 'inativa')) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
};

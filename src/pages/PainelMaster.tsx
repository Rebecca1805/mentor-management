import { useAllProfiles, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, PauseCircle, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PainelMaster() {
  const { user } = useAuth();
  const { data: profiles = [], isLoading } = useAllProfiles();
  const updateProfile = useUpdateProfile();

  const handleUpdateStatus = (userId: string, status: 'ativa' | 'suspensa' | 'inativa') => {
    updateProfile.mutate({
      userId,
      status,
      approvedBy: status === 'ativa' ? user?.id : undefined
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { variant: "outline" as const, icon: PauseCircle, color: "text-yellow-600" },
      ativa: { variant: "default" as const, icon: CheckCircle, color: "text-success" },
      inativa: { variant: "secondary" as const, icon: XCircle, color: "text-muted-foreground" },
      suspensa: { variant: "destructive" as const, icon: XCircle, color: "text-destructive" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const pendentes = profiles.filter(p => p.status === 'pendente');
  const ativas = profiles.filter(p => p.status === 'ativa');
  const suspensas = profiles.filter(p => p.status === 'suspensa');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-poppins" style={{ fontWeight: 700 }}>
          Gerenciar Mentoras
        </h1>
        <p className="text-muted-foreground mt-2">
          Aprove, suspenda ou gerencie o acesso de mentoras à plataforma
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="card-premium border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-sm font-light text-muted-foreground flex items-center gap-2">
              <PauseCircle className="h-4 w-4 text-yellow-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-poppins font-semibold text-yellow-600">{pendentes.length}</p>
          </CardContent>
        </Card>

        <Card className="card-premium border-success/30">
          <CardHeader>
            <CardTitle className="text-sm font-light text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-poppins font-semibold text-success">{ativas.length}</p>
          </CardContent>
        </Card>

        <Card className="card-premium border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm font-light text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Suspensas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-poppins font-semibold text-destructive">{suspensas.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Mentoras */}
      <div className="space-y-4">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="card-premium">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <h3 className="font-poppins font-semibold text-lg">{profile.full_name}</h3>
                      {getStatusBadge(profile.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <p>Cadastro: {format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                      {profile.approved_at && (
                        <p>Aprovada em: {format(new Date(profile.approved_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                      )}
                      <p>Plano: {profile.subscription_plan}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {profile.status === 'pendente' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUpdateStatus(profile.user_id, 'ativa')}
                          className="btn-gradient"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateStatus(profile.user_id, 'inativa')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Recusar
                        </Button>
                      </>
                    )}
                    {profile.status === 'ativa' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(profile.user_id, 'suspensa')}
                      >
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Suspender
                      </Button>
                    )}
                    {profile.status === 'suspensa' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleUpdateStatus(profile.user_id, 'ativa')}
                        className="btn-gradient"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reativar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {profiles.length === 0 && (
          <Card className="card-premium">
            <CardContent className="p-12 text-center">
              <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-poppins mb-2">Nenhuma mentora cadastrada</h3>
              <p className="text-muted-foreground">
                Aguarde o cadastro de novas mentoras para gerenciar seus acessos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}

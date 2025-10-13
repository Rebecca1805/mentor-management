import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useMentorStats } from "@/hooks/useMentorStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users, BookOpen, DollarSign, Calendar, CreditCard, Mail, Phone, Building2 } from "lucide-react";
import { formatarDataBR } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: stats, isLoading: isLoadingStats } = useMentorStats();

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'default';
      case 'pendente':
        return 'outline';
      case 'suspensa':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPlanoBadge = (plano: string) => {
    const planoFormatado = plano === 'estrategico' ? 'Estratégico' : 
                          plano === 'condutor' ? 'Condutor' : 
                          plano === 'visionario' ? 'Visionário' : plano;
    return <Badge variant="secondary" className="font-light">{planoFormatado}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-poppins" style={{ fontWeight: 700 }}>
          Bem-vindo(a), {profile?.full_name}
        </h1>
        <p className="text-muted-foreground font-light">
          Gerencie sua conta e acompanhe suas atividades
        </p>
      </motion.div>

      {/* Perfil do Mentor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-premium border-primary/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Seu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground font-light">Nome Completo</p>
                  <p className="text-lg font-poppins">{profile?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-light">E-mail</p>
                  <p className="text-lg font-poppins">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-light">Status</p>
                  <Badge variant={getStatusVariant(profile?.status || '')} className="mt-1">
                    {profile?.status === 'ativa' ? 'Ativa' : 
                     profile?.status === 'pendente' ? 'Pendente' : 
                     profile?.status === 'suspensa' ? 'Suspensa' : 'Inativa'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground font-light flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Ativação
                  </p>
                  <p className="text-lg font-poppins">{formatarDataBR(profile?.approved_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-light flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Expiração
                  </p>
                  <p className="text-lg font-poppins">{formatarDataBR(profile?.subscription_expires_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-light flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Plano Atual
                  </p>
                  <div className="mt-1">
                    {getPlanoBadge(profile?.subscription_plan || 'free')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Estatísticas Rápidas */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-premium hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-light text-muted-foreground">
                <Users className="h-5 w-5 text-primary" />
                Alunos Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light">Ativos:</span>
                  <span className="text-2xl font-poppins text-success" style={{ fontWeight: 700 }}>
                    {stats?.alunosAtivos || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light">Inativos:</span>
                  <span className="text-2xl font-poppins text-muted-foreground" style={{ fontWeight: 700 }}>
                    {stats?.alunosInativos || 0}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-light">Total:</span>
                    <span className="text-3xl font-poppins text-primary" style={{ fontWeight: 700 }}>
                      {stats?.totalAlunos || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-premium hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-light text-muted-foreground">
                <BookOpen className="h-5 w-5 text-secondary" />
                Cursos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-sm font-light text-muted-foreground mb-2">Total Cadastrados</p>
                <p className="text-5xl font-poppins text-secondary" style={{ fontWeight: 700 }}>
                  {stats?.totalCursos || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-premium hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-light text-muted-foreground">
                <DollarSign className="h-5 w-5 text-accent" />
                Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-light text-muted-foreground">Mês Atual</p>
                  <p className="text-2xl font-poppins text-accent" style={{ fontWeight: 700 }}>
                    R$ {(stats?.vendasMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-light text-muted-foreground">Total</p>
                  <p className="text-2xl font-poppins text-primary" style={{ fontWeight: 700 }}>
                    R$ {(stats?.vendasTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      )}

      {/* Informações do Desenvolvedor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="card-premium bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Desenvolvido por
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-poppins text-primary" style={{ fontWeight: 700 }}>
                  BECC Automação
                </h3>
                <p className="text-sm text-muted-foreground font-light">CNPJ: 61.224.326/0001-97</p>
              </div>
              <div>
                <h4 className="text-lg font-poppins mb-3" style={{ fontWeight: 600 }}>
                  📧 Fale Conosco
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="mailto:atendimento@beccai.com.br" 
                      className="text-sm text-primary hover:underline font-light"
                    >
                      atendimento@beccai.com.br
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="tel:+5515981483402" 
                      className="text-sm text-primary hover:underline font-light"
                    >
                      +55 15 98148.3402
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

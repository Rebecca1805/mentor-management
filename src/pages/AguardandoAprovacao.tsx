import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, Mail, CheckCircle } from "lucide-react";
import { signOut } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AguardandoAprovacao() {
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="card-premium border-primary/30">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6"
            >
              <Clock className="h-12 w-12 text-white" />
            </motion.div>

            <h1 className="text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-poppins mb-4" style={{ fontWeight: 700 }}>
              Aguardando Aprovação
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Olá, <span className="font-semibold text-foreground">{profile?.full_name}</span>!
            </p>

            <div className="space-y-4 text-left mb-8 bg-muted/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Seu cadastro está em análise</h3>
                  <p className="text-sm text-muted-foreground">
                    Nossa equipe está revisando suas informações e em breve você receberá um e-mail com a confirmação.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">O que acontece depois?</h3>
                  <p className="text-sm text-muted-foreground">
                    Assim que sua conta for aprovada, você terá acesso completo à plataforma para gerenciar seus alunos e cursos.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleLogout} variant="outline" size="lg">
                Fazer Logout
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-8">
              Tempo médio de aprovação: 24-48 horas
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

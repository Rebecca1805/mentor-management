import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldOff, Mail } from "lucide-react";
import { signOut } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AcessoNegado() {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-destructive/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="card-premium border-destructive/30">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-destructive to-destructive/60 flex items-center justify-center mx-auto mb-6"
            >
              <ShieldOff className="h-12 w-12 text-white" />
            </motion.div>

            <h1 className="text-3xl bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent font-poppins mb-4" style={{ fontWeight: 700 }}>
              Acesso Negado
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Seu acesso à plataforma foi suspenso ou desativado.
            </p>

            <div className="space-y-4 text-left mb-8 bg-muted/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Entre em contato</h3>
                  <p className="text-sm text-muted-foreground">
                    Se você acredita que isso é um erro, entre em contato com o administrador da plataforma para mais informações.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleLogout} variant="destructive" size="lg">
              Fazer Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

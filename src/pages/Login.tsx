import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { signIn } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Email não confirmado. Verifique sua caixa de entrada.");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos. Verifique suas credenciais.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Verificar se o usuário está aprovado
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("status")
        .eq("user_id", data.user.id)
        .single();

      if (profileError) {
        toast.error("Erro ao verificar perfil do usuário.");
        await supabase.auth.signOut();
        return;
      }

      if (profile?.status === "pendente") {
        await supabase.auth.signOut();
        toast.error("Sua conta ainda está aguardando aprovação.");
        return;
      }

      if (profile?.status === "suspensa" || profile?.status === "inativa") {
        await supabase.auth.signOut();
        toast.error("Sua conta foi suspensa ou inativada. Entre em contato com o suporte.");
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md card-premium">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-poppins" style={{ fontWeight: 700 }}>
              MentorManagement
            </CardTitle>
            <CardDescription className="font-light">Entre para acessar sua plataforma de mentoria</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-light">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-light">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full btn-gradient"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <p className="text-center text-sm text-muted-foreground mt-6 font-light">
              Não tem uma conta?{" "}
              <Link to="/signup" className="text-primary hover:underline font-light">
                Cadastre-se
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

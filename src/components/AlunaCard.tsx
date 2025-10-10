import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Aluna, getCursosConcluidos } from "@/hooks/useAlunas";
import { BookOpen, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AlunaCardProps {
  aluna: Aluna;
  index: number;
}

export const AlunaCard = ({ aluna, index }: AlunaCardProps) => {
  const navigate = useNavigate();
  
  const cursosConcluidosCount = getCursosConcluidos(aluna);
  const progressoPercentual = aluna.cursos_adquiridos.length > 0
    ? (cursosConcluidosCount / aluna.cursos_adquiridos.length) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="card-premium h-full flex flex-col">
        <CardContent className="pt-6 flex-1">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">{aluna.nome}</h3>
                <p className="text-sm text-muted-foreground">{aluna.email}</p>
              </div>
              <Badge
                className={`badge-status ${
                  aluna.status === "Ativa"
                    ? "bg-success/10 text-success ring-success/20"
                    : "bg-muted text-muted-foreground ring-border"
                }`}
              >
                {aluna.status}
              </Badge>
            </div>

            {aluna.curso_atual && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  Curso: <span className="font-medium text-foreground">{aluna.curso_atual}</span>
                </span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso de Cursos</span>
                <span className="font-semibold text-primary">{Math.round(progressoPercentual)}%</span>
              </div>
              <Progress value={progressoPercentual} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {cursosConcluidosCount} de {aluna.cursos_adquiridos.length} cursos concluídos
              </p>
            </div>

            {aluna.data_primeira_compra && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Cliente há {aluna.tempo_base} dias
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            className="w-full btn-gradient"
            onClick={() => navigate(`/aluna/${aluna.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

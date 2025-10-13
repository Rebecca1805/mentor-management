import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Aluna } from "@/hooks/useAlunas";
import { AlunoCurso } from "@/hooks/useCursos";
import { BookOpen, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calcularTempoBase } from "@/lib/utils";
import { computeAlunaData } from "@/hooks/useComputedAlunaData";

interface AlunaCardNewProps {
  aluna: Aluna;
  alunoCursos: AlunoCurso[];
  index: number;
}

export const AlunaCardNew = ({ aluna, alunoCursos, index }: AlunaCardNewProps) => {
  const navigate = useNavigate();
  
  const computedData = computeAlunaData(alunoCursos);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ y: -4 }}
    >
      <Card className="card-premium h-full flex flex-col hover:shadow-lg">
        <CardContent className="pt-6 flex-1 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-poppins font-light text-lg mb-1 tracking-tight">{aluna.nome}</h3>
              <p className="text-sm text-muted-foreground font-light">{aluna.email}</p>
            </div>
            <Badge
              className={`badge-status ${
                aluna.status === "Ativa" || aluna.status === "Ativo"
                  ? "bg-success/10 text-success ring-success/20"
                  : "bg-muted text-muted-foreground ring-border"
              }`}
              aria-label={`Status: ${aluna.status}`}
            >
              {aluna.status}
            </Badge>
          </div>

          {aluna.curso_atual && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground font-light truncate">
                {aluna.curso_atual}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-light">Progresso</span>
              <span className="font-poppins font-semibold text-primary">{Math.round(computedData.progresso_percentual)}%</span>
            </div>
            <Progress value={computedData.progresso_percentual} className="h-2" />
            <p className="text-xs text-muted-foreground font-light">
              {computedData.cursos_concluidos} de {computedData.total_cursos} concluídos
            </p>
          </div>

          {computedData.data_primeira_compra && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-light" title="Tempo desde a primeira compra">
                {calcularTempoBase(computedData.data_primeira_compra, aluna.status, aluna.data_inativacao, computedData.data_ultima_compra)} dias na base
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            className="w-full btn-gradient group"
            onClick={() => navigate(`/aluna/${aluna.id}`)}
            aria-label={`Ver detalhes de ${aluna.nome}`}
          >
            <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Ver Detalhes
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

import { useParams, useNavigate } from "react-router-dom";
import { useAluna, usePlanosAcao, useVendas, getCursosConcluidos } from "@/hooks/useAlunas";
import { useUpdatePlanoAcao } from "@/hooks/usePlanosAcao";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AlunaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: aluna, isLoading } = useAluna(Number(id));
  const { data: planos = [] } = usePlanosAcao(Number(id));
  const { data: vendas = [] } = useVendas(Number(id));
  const updatePlano = useUpdatePlanoAcao();

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!aluna) {
    return <div className="p-8">Aluna não encontrada</div>;
  }

  const cursosConcluidos = getCursosConcluidos(aluna);
  const progressoCursos = aluna.cursos_adquiridos.length > 0
    ? (cursosConcluidos / aluna.cursos_adquiridos.length) * 100
    : 0;

  const vendasPorPeriodo = vendas.reduce((acc, venda) => {
    const existing = acc.find(v => v.periodo === venda.periodo);
    if (existing) {
      existing.valor += venda.valor_vendido;
    } else {
      acc.push({ periodo: venda.periodo, valor: venda.valor_vendido });
    }
    return acc;
  }, [] as { periodo: string; valor: number }[]);

  const toggleEtapa = (planoId: number, etapa: string, etapasConcluidas: string[]) => {
    const novasEtapas = etapasConcluidas.includes(etapa)
      ? etapasConcluidas.filter(e => e !== etapa)
      : [...etapasConcluidas, etapa];
    
    updatePlano.mutate({ id: planoId, etapas_concluidas: novasEtapas });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-6xl mx-auto"
    >
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="bg-card rounded-2xl p-8 shadow-elegant mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-white">
              {aluna.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{aluna.nome}</h1>
              <p className="text-muted-foreground mb-2">{aluna.email}</p>
              <div className="flex gap-2">
                <Badge variant={aluna.status === "Ativa" ? "default" : "secondary"}>
                  {aluna.status}
                </Badge>
                <Badge variant="outline">{aluna.tempo_base} dias na base</Badge>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate(`/aluna/editar/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>

        {aluna.curso_atual && (
          <div className="bg-background/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Curso Atual</p>
            <p className="font-semibold">{aluna.curso_atual}</p>
          </div>
        )}
      </div>

      <Accordion type="multiple" className="space-y-4">
        <AccordionItem value="cursos" className="bg-card rounded-2xl shadow-elegant border-0 px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Cursos Adquiridos
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progresso Geral</span>
                  <span className="text-sm font-semibold">{Math.round(progressoCursos)}%</span>
                </div>
                <Progress value={progressoCursos} className="h-2" />
              </div>
              <div className="grid gap-2">
                {aluna.cursos_adquiridos.map((curso, idx) => (
                  <div key={idx} className="bg-background/50 rounded-lg p-3 flex justify-between items-center">
                    <span className="font-medium">{curso.nome}</span>
                    <Badge variant={
                      curso.status === 'concluido' ? 'default' : 
                      curso.status === 'em_andamento' ? 'secondary' : 
                      'outline'
                    }>
                      {curso.status === 'concluido' ? 'Concluído' :
                       curso.status === 'em_andamento' ? 'Em Andamento' :
                       curso.status === 'pausado' ? 'Pausado' :
                       'Não Iniciado'}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {cursosConcluidos} de {aluna.cursos_adquiridos.length} cursos concluídos
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dificuldades" className="bg-card rounded-2xl shadow-elegant border-0 px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Principais Dificuldades
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <p className="text-muted-foreground mb-4">
                {aluna.principais_dificuldades || "Nenhuma dificuldade registrada"}
              </p>
              {aluna.observacoes_mentora && (
                <div className="bg-background/50 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">Observações da Mentora</p>
                  <p className="text-sm">{aluna.observacoes_mentora}</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="planos" className="bg-card rounded-2xl shadow-elegant border-0 px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Planos de Ação ({planos.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <Button onClick={() => navigate(`/aluna/${id}/novo-plano`)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Novo Plano de Ação
              </Button>
              {planos.map((plano) => (
                <div key={plano.id} className="bg-background/50 rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">{plano.objetivo}</h4>
                    {plano.resultado_esperado && (
                      <p className="text-sm text-muted-foreground">{plano.resultado_esperado}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {plano.data_inicio && (
                      <div>
                        <span className="text-muted-foreground">Início:</span> {plano.data_inicio}
                      </div>
                    )}
                    {plano.data_fim_prevista && (
                      <div>
                        <span className="text-muted-foreground">Previsão:</span> {plano.data_fim_prevista}
                      </div>
                    )}
                    {plano.data_fim_real && (
                      <div>
                        <span className="text-muted-foreground">Concluído:</span> {plano.data_fim_real}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Etapas:</p>
                    {plano.etapas.map((etapa, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Checkbox
                          checked={plano.etapas_concluidas.includes(etapa)}
                          onCheckedChange={() => toggleEtapa(plano.id, etapa, plano.etapas_concluidas)}
                        />
                        <span className={plano.etapas_concluidas.includes(etapa) ? "line-through text-muted-foreground" : ""}>
                          {etapa}
                        </span>
                      </div>
                    ))}
                  </div>
                  {plano.resultados_obtidos && (
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-sm font-semibold mb-1">Resultados Obtidos</p>
                      <p className="text-sm text-muted-foreground">{plano.resultados_obtidos}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vendas" className="bg-card rounded-2xl shadow-elegant border-0 px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Resultados e Vendas
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              {vendasPorPeriodo.length > 0 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendasPorPeriodo}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="periodo" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="space-y-3">
                {vendas.map((venda) => (
                  <div key={venda.id} className="bg-background/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Período: {venda.periodo}</p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {venda.valor_vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    {venda.produtos.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground mb-1">Produtos:</p>
                        <div className="flex flex-wrap gap-1">
                          {venda.produtos.map((prod, idx) => (
                            <Badge key={idx} variant="outline">{prod}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {venda.observacoes && (
                      <p className="text-sm text-muted-foreground">{venda.observacoes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

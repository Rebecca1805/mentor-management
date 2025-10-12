import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAluna, usePlanosAcao, useVendas, getCursosConcluidos } from "@/hooks/useAlunas";
import { useUpdatePlanoAcao } from "@/hooks/usePlanosAcao";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { ObservacoesTable } from "@/components/ObservacoesTable";
import { AlunaDetalhesSkeleton } from "@/components/LoadingSkeletons";
import { calcularTempoBase } from "@/lib/utils";

export default function AlunaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: aluna, isLoading } = useAluna(Number(id));
  const { data: planos = [] } = usePlanosAcao(Number(id));
  const { data: vendas = [] } = useVendas(Number(id));
  const updatePlano = useUpdatePlanoAcao();

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="p-8">
          <AlunaDetalhesSkeleton />
        </div>
      </TooltipProvider>
    );
  }

  if (!aluna) {
    return <div className="p-8">Aluno não encontrado</div>;
  }

  const cursosConcluidos = getCursosConcluidos(aluna);
  const progressoCursos = aluna.cursos_adquiridos.length > 0
    ? (cursosConcluidos / aluna.cursos_adquiridos.length) * 100
    : 0;

  const vendasPorPeriodo = vendas
    .reduce((acc, venda) => {
      const existing = acc.find(v => v.periodo === venda.periodo);
      if (existing) {
        existing.valor += venda.valor_vendido;
      } else {
        acc.push({ periodo: venda.periodo, valor: venda.valor_vendido });
      }
      return acc;
    }, [] as { periodo: string; valor: number }[])
    .sort((a, b) => {
      // Ordenar por período no formato MM/AA (crescente)
      const [mesA, anoA] = a.periodo.split('/');
      const [mesB, anoB] = b.periodo.split('/');
      const dataA = parseInt(`20${anoA}${mesA}`);
      const dataB = parseInt(`20${anoB}${mesB}`);
      return dataA - dataB;
    });

  const totalVendas = vendas.reduce((sum, v) => sum + v.valor_vendido, 0);

  const toggleEtapa = (planoId: number, etapa: string, etapasConcluidas: string[]) => {
    const novasEtapas = etapasConcluidas.includes(etapa)
      ? etapasConcluidas.filter(e => e !== etapa)
      : [...etapasConcluidas, etapa];
    
    updatePlano.mutate({ id: planoId, etapas_concluidas: novasEtapas });
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
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
                <Badge variant={aluna.status === "Ativo" ? "default" : "secondary"}>
                  {aluna.status}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help">
                      {calcularTempoBase(aluna.data_primeira_compra, aluna.status, aluna.data_inativacao)} dias na base
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-light">Tempo desde a primeira compra</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/aluna/${id}/ficha`)}>
              <FileText className="mr-2 h-4 w-4" />
              Ver Ficha
            </Button>
          </div>
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

        <AccordionItem value="observacoes" className="bg-card rounded-2xl shadow-elegant border-0 px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Observações e Planos da Mentora
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <ObservacoesTable idAluna={Number(id)} />
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
            Vendas ({vendas.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              {/* Header com Total */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Vendas</p>
                  <p className="text-3xl font-bold text-primary">
                    R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {vendas.length === 0 ? (
                <div className="empty-state py-8">
                  <p className="empty-state-title">Nenhuma venda registrada</p>
                  <p className="empty-state-description">Nenhuma venda foi registrada para este aluno</p>
                </div>
              ) : (
                <>
                  {/* Layout: Gráfico e Tabela */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Gráfico */}
                    <div className="order-2 lg:order-1">
                      <h4 className="text-sm font-semibold mb-4">Evolução de Vendas</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={vendasPorPeriodo}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis 
                              dataKey="periodo" 
                              stroke="hsl(var(--muted-foreground))"
                              style={{ fontSize: '12px', fontWeight: 300 }}
                            />
                            <YAxis 
                              stroke="hsl(var(--muted-foreground))"
                              style={{ fontSize: '12px', fontWeight: 300 }}
                            />
                            <RechartsTooltip 
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 300,
                              }}
                              formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                            />
                            <Legend 
                              wrapperStyle={{ fontSize: '12px', fontWeight: 300 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="valor" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              name="Valor"
                              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Tabela de Vendas */}
                    <div className="order-1 lg:order-2 overflow-hidden">
                      <h4 className="text-sm font-semibold mb-4">Detalhes das Vendas</h4>
                      <div className="border rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Período</TableHead>
                              <TableHead>Produtos</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vendas.map((venda) => (
                              <TableRow key={venda.id}>
                                <TableCell className="font-medium">{venda.periodo}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {venda.produtos.length > 0 ? (
                                      venda.produtos.map((prod, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {prod}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  R$ {venda.valor_vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  </TooltipProvider>
  );
}

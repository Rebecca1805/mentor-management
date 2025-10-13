import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAluna, usePlanosAcao, useVendas, getCursosConcluidos } from "@/hooks/useAlunas";
import { useUpdatePlanoAcao } from "@/hooks/usePlanosAcao";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { ObservacoesTableReadOnly } from "@/components/ObservacoesTableReadOnly";
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
      <div className="p-8">
        <AlunaDetalhesSkeleton />
      </div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/painel-alunas")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {aluna.nome}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={aluna.status === "Ativo" || aluna.status === "Ativa" ? "default" : "secondary"}>
              {aluna.status}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{aluna.email}</span>
          </div>
        </div>
        <Button onClick={() => navigate(`/aluna/${id}/ficha`)}>
          <FileText className="h-4 w-4 mr-2" />
          Ver Ficha Completa
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-4" defaultValue={["info", "cursos", "vendas"]}>
        <AccordionItem value="info" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Informações Gerais</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                <p className="text-lg font-medium">{new Date(aluna.data_cadastro).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo na Base</p>
                <p className="text-lg font-medium">
                  {calcularTempoBase(aluna.data_primeira_compra, aluna.status, aluna.data_inativacao, aluna.data_ultima_compra)} dias
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Curso Atual</p>
                <p className="text-lg font-medium">{aluna.curso_atual || "Não informado"}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cursos" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Cursos</span>
              <Badge variant="secondary">{aluna.cursos_adquiridos.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Progresso Geral</span>
                  <span className="text-sm font-medium">{cursosConcluidos} de {aluna.cursos_adquiridos.length} concluídos</span>
                </div>
                <Progress value={progressoCursos} className="h-2" />
              </div>
              <div className="space-y-2">
                {aluna.cursos_adquiridos.map((curso, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{curso.nome}</span>
                    <Badge variant={curso.status === "concluido" ? "default" : "outline"}>
                      {curso.status === "concluido" ? "Concluído" : "Em andamento"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vendas" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Vendas</span>
              <Badge variant="secondary">R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {vendasPorPeriodo.length > 0 && (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vendasPorPeriodo}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="valor" stroke="hsl(var(--primary))" name="Valor (R$)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>{venda.periodo}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {venda.produtos.map((produto, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {produto}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {venda.valor_vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {venda.observacoes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="observacoes" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Observações da Mentora</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <ObservacoesTableReadOnly idAluna={Number(id)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="planos" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Planos de Ação</span>
              <Badge variant="secondary">{planos.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {planos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum plano de ação cadastrado</p>
              ) : (
                planos.map((plano) => {
                  const etapas = plano.etapas || [];
                  const etapasConcluidas = plano.etapas_concluidas || [];
                  const progresso = etapas.length > 0 ? (etapasConcluidas.length / etapas.length) * 100 : 0;

                  return (
                    <div key={plano.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{plano.objetivo}</h4>
                          <p className="text-sm text-muted-foreground">{plano.resultado_esperado}</p>
                        </div>
                        <Badge variant={plano.data_fim_real ? "default" : "outline"}>
                          {plano.data_fim_real ? "Concluído" : "Em andamento"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{etapasConcluidas.length} de {etapas.length} etapas</span>
                        </div>
                        <Progress value={progresso} className="h-2" />
                      </div>

                      {etapas.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Etapas:</p>
                          {etapas.map((etapa, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Checkbox
                                checked={etapasConcluidas.includes(etapa)}
                                onCheckedChange={() => toggleEtapa(plano.id, etapa, etapasConcluidas)}
                                disabled={!!plano.data_fim_real}
                              />
                              <span className={etapasConcluidas.includes(etapa) ? "line-through text-muted-foreground" : ""}>
                                {etapa}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {plano.resultados_obtidos && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-1">Resultados Obtidos:</p>
                          <p className="text-sm text-muted-foreground">{plano.resultados_obtidos}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, DollarSign, BookOpen, Target, UserX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAlunas } from "@/hooks/useAlunas";
import { useVendas } from "@/hooks/useAlunas";

export default function Relatorios() {
  const { data: alunas, isLoading: isLoadingAlunas } = useAlunas();
  const { data: vendas, isLoading: isLoadingVendas } = useVendas();

  const { data: cursosVendidos } = useQuery({
    queryKey: ["cursos-vendidos"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("aluno_cursos")
        .select("*, cursos(nome)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    }
  });

  const { data: planosAcao } = useQuery({
    queryKey: ["planos_acao"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("planos_acao")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    }
  });

  // Processar métricas
  const alunasAtivas = alunas?.filter(a => a.status === "Ativo" || a.status === "Ativa").length || 0;
  const alunasInativas = alunas?.filter(a => a.status === "Inativo" || a.status === "Inativa").length || 0;
  const receitaTotal = vendas?.reduce((sum, v) => sum + Number(v.valor_vendido || 0), 0) || 0;
  
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  const periodoAtual = `${String(mesAtual).padStart(2, '0')}/${anoAtual}`;
  const receitaMesAtual = vendas?.filter(v => v.periodo === periodoAtual)
    .reduce((sum, v) => sum + Number(v.valor_vendido || 0), 0) || 0;

  const totalCursosVendidos = cursosVendidos?.length || 0;
  const planosAtivos = planosAcao?.filter(p => !p.data_fim_real).length || 0;
  const planosConcluidos = planosAcao?.filter(p => p.data_fim_real).length || 0;
  const totalPlanos = planosAcao?.length || 0;
  const taxaConclusao = totalPlanos > 0 ? (planosConcluidos / totalPlanos) * 100 : 0;

  // Processar vendas por período
  const vendasPorPeriodo = vendas?.reduce((acc, venda) => {
    const periodo = venda.periodo;
    const existing = acc.find(item => item.periodo === periodo);
    if (existing) {
      existing.valor += Number(venda.valor_vendido || 0);
    } else {
      acc.push({ periodo, valor: Number(venda.valor_vendido || 0) });
    }
    return acc;
  }, [] as Array<{ periodo: string; valor: number }>)
  ?.sort((a, b) => {
    const [mesA, anoA] = a.periodo.split('/');
    const [mesB, anoB] = b.periodo.split('/');
    return new Date(`${anoA}-${mesA}`).getTime() - new Date(`${anoB}-${mesB}`).getTime();
  }) || [];

  // Top 5 cursos
  const topCursos = cursosVendidos?.reduce((acc, cv) => {
    const nome = cv.cursos?.nome || "Sem nome";
    const existing = acc.find(item => item.curso === nome);
    if (existing) {
      existing.quantidade += 1;
    } else {
      acc.push({ curso: nome, quantidade: 1 });
    }
    return acc;
  }, [] as Array<{ curso: string; quantidade: number }>)
  ?.sort((a, b) => b.quantidade - a.quantidade)
  .slice(0, 5) || [];

  const isLoading = isLoadingAlunas || isLoadingVendas;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alunas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alunasAtivas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de alunas cadastradas: {alunas?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alunas Inativas</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alunasInativas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {alunasInativas > 0 ? `${((alunasInativas / (alunas?.length || 1)) * 100).toFixed(1)}% do total` : "Nenhuma aluna inativa"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as vendas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receitaMesAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {periodoAtual}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cursos Vendidos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCursosVendidos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de matrículas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planos de Ação Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planosAtivos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {planosConcluidos} concluídos de {totalPlanos} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {vendasPorPeriodo.length > 0 ? (
              <ChartContainer
                config={{
                  valor: {
                    label: "Valor Vendido",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vendasPorPeriodo}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="periodo" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Valor Vendido"]}
                    />
                    <Bar dataKey="valor" fill="var(--color-valor)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhuma venda registrada ainda</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Cursos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topCursos.length > 0 ? (
              <div className="space-y-4">
                {topCursos.map((curso, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <span className="font-medium">{curso.curso}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={(curso.quantidade / (topCursos[0]?.quantidade || 1)) * 100} 
                        className="w-24"
                      />
                      <span className="text-sm font-semibold w-8 text-right">{curso.quantidade}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhum curso vendido ainda</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status de Planos de Ação */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Planos de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          {totalPlanos > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{totalPlanos}</div>
                  <p className="text-sm text-muted-foreground mt-1">Total de Planos</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{planosConcluidos}</div>
                  <p className="text-sm text-muted-foreground mt-1">Concluídos</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{planosAtivos}</div>
                  <p className="text-sm text-muted-foreground mt-1">Em Andamento</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Conclusão</span>
                  <span className="font-semibold">{taxaConclusao.toFixed(1)}%</span>
                </div>
                <Progress value={taxaConclusao} className="h-3" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Nenhum plano de ação criado ainda</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

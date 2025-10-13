import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAlunas } from "@/hooks/useAlunas";
import { useVendas as useVendasHook, getCursosConcluidos } from "@/hooks/useAlunas";
import { DashboardFilters } from "@/components/DashboardFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, Download, Info } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { isWithinInterval, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { calcularTempoBase, formatarDataBR } from "@/lib/utils";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Relatorios() {
  const { data: alunas, isLoading: isLoadingAlunas } = useAlunas();
  const { data: vendas, isLoading: isLoadingVendas } = useVendasHook();
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedAlunas, setSelectedAlunas] = useState<number[]>([]);
  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);

  const isLoading = isLoadingAlunas || isLoadingVendas;

  const filteredAlunas = useMemo(() => {
    if (!alunas) return [];

    return alunas.filter((aluna) => {
      // Date range filter (data_cadastro)
      if (dateRange.from || dateRange.to) {
        try {
          const cadastroDate = parseISO(aluna.data_cadastro);
          if (dateRange.from && dateRange.to) {
            if (!isWithinInterval(cadastroDate, { start: dateRange.from, end: dateRange.to })) {
              return false;
            }
          } else if (dateRange.from) {
            if (cadastroDate < dateRange.from) return false;
          } else if (dateRange.to) {
            if (cadastroDate > dateRange.to) return false;
          }
        } catch (e) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus.length > 0 && !selectedStatus.includes(aluna.status)) {
        return false;
      }

      // Aluna filter
      if (selectedAlunas.length > 0 && !selectedAlunas.includes(aluna.id)) {
        return false;
      }

      // Curso filter
      if (selectedCursos.length > 0) {
        const alunasCursos = aluna.cursos_adquiridos.map(c => c.nome);
        if (!selectedCursos.some(curso => alunasCursos.includes(curso))) {
          return false;
        }
      }

      return true;
    });
  }, [alunas, dateRange, selectedStatus, selectedAlunas, selectedCursos]);

  const cursosUnicos = useMemo(() => {
    if (!alunas) return [];
    const cursos = new Set<string>();
    alunas.forEach(aluna => {
      aluna.cursos_adquiridos.forEach(curso => {
        cursos.add(curso.nome);
      });
    });
    return Array.from(cursos).sort();
  }, [alunas]);

  const stats = useMemo(() => {
    if (!filteredAlunas || !vendas) {
      return {
        faturamentoAtivas: 0,
        faturamentoTotal: 0,
        percentualAtivas: 0,
        tempoMedio: 0,
      };
    }

    const alunasAtivas = filteredAlunas.filter(a => a.status === "Ativo" || a.status === "Ativa");
    const idsAtivas = new Set(alunasAtivas.map(a => a.id));
    const idsTotal = new Set(filteredAlunas.map(a => a.id));

    // Filter vendas by date range
    let vendasFiltradas = vendas;
    if (dateRange.from || dateRange.to) {
      vendasFiltradas = vendas.filter(venda => {
        try {
          // Parse periodo (formato YYYY-MM ou similar)
          const periodoDate = parseISO(venda.periodo + "-01");
          if (dateRange.from && dateRange.to) {
            return isWithinInterval(periodoDate, { start: dateRange.from, end: dateRange.to });
          } else if (dateRange.from) {
            return periodoDate >= dateRange.from;
          } else if (dateRange.to) {
            return periodoDate <= dateRange.to;
          }
        } catch (e) {
          return true;
        }
        return true;
      });
    }

    const faturamentoAtivas = vendasFiltradas
      .filter(v => idsAtivas.has(v.id_aluna))
      .reduce((acc, v) => acc + v.valor_vendido, 0);

    const faturamentoTotal = vendasFiltradas
      .filter(v => idsTotal.has(v.id_aluna))
      .reduce((acc, v) => acc + v.valor_vendido, 0);

    const tempoMedio = filteredAlunas.length > 0
      ? filteredAlunas.reduce((acc, a) => acc + calcularTempoBase(a.data_primeira_compra, a.status, a.data_inativacao, a.data_ultima_compra), 0) / filteredAlunas.length
      : 0;

    const percentualAtivas = filteredAlunas.length > 0
      ? (alunasAtivas.length / filteredAlunas.length) * 100
      : 0;

    return {
      faturamentoAtivas,
      faturamentoTotal,
      percentualAtivas,
      tempoMedio: Math.round(tempoMedio),
    };
  }, [filteredAlunas, vendas, dateRange]);

  const statusData = useMemo(() => {
    if (!filteredAlunas) return [];
    const ativas = filteredAlunas.filter(a => a.status === "Ativo" || a.status === "Ativa").length;
    const inativas = filteredAlunas.length - ativas;
    return [
      { name: "Ativos", value: ativas },
      { name: "Inativos", value: inativas },
    ];
  }, [filteredAlunas]);

  const faturamentoPorPeriodo = useMemo(() => {
    if (!vendas || !filteredAlunas) return [];

    const idsAlunas = new Set(filteredAlunas.map(a => a.id));
    const idsAtivas = new Set(filteredAlunas.filter(a => a.status === "Ativo" || a.status === "Ativa").map(a => a.id));

    // Filter vendas by date range
    let vendasFiltradas = vendas.filter(v => idsAlunas.has(v.id_aluna));
    
    if (dateRange.from || dateRange.to) {
      vendasFiltradas = vendasFiltradas.filter(venda => {
        try {
          const periodoDate = parseISO(venda.periodo + "-01");
          if (dateRange.from && dateRange.to) {
            return isWithinInterval(periodoDate, { start: dateRange.from, end: dateRange.to });
          } else if (dateRange.from) {
            return periodoDate >= dateRange.from;
          } else if (dateRange.to) {
            return periodoDate <= dateRange.to;
          }
        } catch (e) {
          return true;
        }
        return true;
      });
    }

    const porPeriodo = vendasFiltradas.reduce((acc, venda) => {
      const periodo = venda.periodo;
      if (!acc[periodo]) {
        acc[periodo] = { periodo, ativas: 0, todas: 0 };
      }
      const valor = venda.valor_vendido;
      acc[periodo].todas += valor;
      if (idsAtivas.has(venda.id_aluna)) {
        acc[periodo].ativas += valor;
      }
      return acc;
    }, {} as Record<string, { periodo: string; ativas: number; todas: number }>);

    return Object.values(porPeriodo)
      .sort((a, b) => a.periodo.localeCompare(b.periodo))
      .slice(-12); // últimos 12 períodos
  }, [vendas, filteredAlunas, dateRange]);

  const evolucaoData = useMemo(() => {
    if (!alunas) return [];
    
    // Group by data_cadastro
    let alunasParaEvolucao = alunas;
    
    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      alunasParaEvolucao = alunas.filter(aluna => {
        try {
          const cadastroDate = parseISO(aluna.data_cadastro);
          if (dateRange.from && dateRange.to) {
            return isWithinInterval(cadastroDate, { start: dateRange.from, end: dateRange.to });
          } else if (dateRange.from) {
            return cadastroDate >= dateRange.from;
          } else if (dateRange.to) {
            return cadastroDate <= dateRange.to;
          }
        } catch (e) {
          return true;
        }
        return true;
      });
    }
    
    const porMes = alunasParaEvolucao.reduce((acc, aluna) => {
      const mes = aluna.data_cadastro.substring(0, 7);
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cumulative count
    const sorted = Object.entries(porMes).sort(([a], [b]) => a.localeCompare(b));
    let cumulative = 0;
    
    return sorted.map(([mes, quantidade]) => {
      cumulative += quantidade;
      return { mes: formatarDataBR(mes + "-01", 'mes-ano'), quantidade: cumulative };
    });
  }, [alunas, dateRange]);

  const exportarCSV = () => {
    const headers = ["Nome", "Email", "Status", "Cursos Concluídos", "Tempo Base", "Receita Total"];
    const rows = filteredAlunas.map(aluna => {
      const vendasAluna = vendas?.filter(v => v.id_aluna === aluna.id) || [];
      const receitaAluna = vendasAluna.reduce((sum, v) => sum + v.valor_vendido, 0);
      return [
        aluna.nome,
        aluna.email,
        aluna.status,
        getCursosConcluidos(aluna),
        calcularTempoBase(aluna.data_primeira_compra, aluna.status, aluna.data_inativacao, aluna.data_ultima_compra),
        receitaAluna.toFixed(2)
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-alunas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-premium">
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="card-premium">
              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const handleResetFilters = () => {
    setDateRange({ from: undefined, to: undefined } as DateRange);
    setSelectedStatus([]);
    setSelectedAlunas([]);
    setSelectedCursos([]);
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
          Relatórios
        </h1>
        <p className="text-muted-foreground font-light">
          Análises e estatísticas detalhadas sobre suas alunas
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <DashboardFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedAlunas={selectedAlunas}
          onAlunasChange={setSelectedAlunas}
          selectedCursos={selectedCursos}
          onCursosChange={setSelectedCursos}
          availableAlunas={alunas || []}
          availableCursos={cursosUnicos}
          onReset={handleResetFilters}
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento (Ativas)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                R$ {stats.faturamentoAtivas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.percentualAtivas.toFixed(1)}% de alunas ativas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faturamento Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                R$ {stats.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ativas + Inativas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Médio (Base)
              </CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {stats.tempoMedio} dias
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Permanência média
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Alunas
              </CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredAlunas.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Após filtros aplicados
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Faturamento por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={faturamentoPorPeriodo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="ativas" fill="hsl(var(--primary))" name="Ativas (R$)" />
                    <Bar dataKey="todas" fill="hsl(var(--secondary))" name="Total (R$)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Evolution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Evolução de Alunas Cadastradas</CardTitle>
            <Button onClick={exportarCSV} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="quantidade" stroke="hsl(var(--primary))" name="Total Acumulado" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

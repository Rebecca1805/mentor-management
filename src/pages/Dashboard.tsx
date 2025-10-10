import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAlunas } from "@/hooks/useAlunas";
import { AlunaCard } from "@/components/AlunaCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, TrendingUp, Clock, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Dashboard() {
  const { data: alunas, isLoading } = useAlunas();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cursoFilter, setCursoFilter] = useState<string>("all");

  const filteredAlunas = useMemo(() => {
    if (!alunas) return [];

    return alunas.filter((aluna) => {
      const matchesSearch = aluna.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          aluna.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || aluna.status === statusFilter;
      const matchesCurso = cursoFilter === "all" || aluna.curso_atual === cursoFilter;

      return matchesSearch && matchesStatus && matchesCurso;
    });
  }, [alunas, searchTerm, statusFilter, cursoFilter]);

  const cursosUnicos = useMemo(() => {
    if (!alunas) return [];
    const cursos = new Set(alunas.map(a => a.curso_atual).filter(Boolean));
    return Array.from(cursos) as string[];
  }, [alunas]);

  const stats = useMemo(() => {
    if (!alunas) return { total: 0, ativas: 0, percentualAtivas: 0, tempoMedio: 0 };

    const ativas = alunas.filter(a => a.status === "Ativa").length;
    const tempoMedio = alunas.reduce((acc, a) => acc + a.tempo_base, 0) / alunas.length;

    return {
      total: alunas.length,
      ativas,
      percentualAtivas: (ativas / alunas.length) * 100,
      tempoMedio: Math.round(tempoMedio),
    };
  }, [alunas]);

  const statusData = useMemo(() => {
    if (!alunas) return [];
    const ativas = alunas.filter(a => a.status === "Ativa").length;
    const inativas = alunas.length - ativas;
    return [
      { name: "Ativas", value: ativas },
      { name: "Inativas", value: inativas },
    ];
  }, [alunas]);

  const progressoData = useMemo(() => {
    if (!alunas) return [];
    const progresso = alunas.map(a => ({
      nome: a.nome.split(" ")[0],
      percentual: a.cursos_adquiridos.length > 0
        ? (a.cursos_concluidos / a.cursos_adquiridos.length) * 100
        : 0
    }));
    return progresso.slice(0, 10);
  }, [alunas]);

  const evolucaoData = useMemo(() => {
    if (!alunas) return [];
    
    const porMes = alunas.reduce((acc, aluna) => {
      if (aluna.data_primeira_compra) {
        const mes = aluna.data_primeira_compra.substring(0, 7);
        acc[mes] = (acc[mes] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(porMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, quantidade]) => ({
        mes,
        quantidade,
      }));
  }, [alunas]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o progresso das suas mentoradas
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Alunas
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alunas Ativas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{Math.round(stats.percentualAtivas)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.ativas} de {stats.total}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Médio
              </CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.tempoMedio}</div>
              <p className="text-xs text-muted-foreground mt-1">dias na base</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cursos Diferentes
              </CardTitle>
              <PieChartIcon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{cursosUnicos.length}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Taxa de Conclusão (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={progressoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentual" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Evolução de Alunas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evolucaoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="quantidade" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="Ativa">Ativa</SelectItem>
            <SelectItem value="Inativa">Inativa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cursoFilter} onValueChange={setCursoFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl">
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Cursos</SelectItem>
            {cursosUnicos.map((curso) => (
              <SelectItem key={curso} value={curso}>
                {curso}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Alunas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAlunas.map((aluna, index) => (
          <AlunaCard key={aluna.id} aluna={aluna} index={index} />
        ))}
      </div>

      {filteredAlunas.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">
            Nenhuma aluna encontrada com os filtros selecionados.
          </p>
        </motion.div>
      )}
    </div>
  );
}

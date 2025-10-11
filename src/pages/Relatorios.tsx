import { useAlunas, useVendas, getCursosConcluidos } from "@/hooks/useAlunas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { calcularTempoBase } from "@/lib/utils";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export default function Relatorios() {
  const { data: alunas = [] } = useAlunas();
  const { data: vendas = [] } = useVendas();
  const [statusFiltro, setStatusFiltro] = useState<string>("Todos");

  const alunasFiltradas = statusFiltro === "Todos" 
    ? alunas 
    : alunas.filter(a => a.status === statusFiltro);

  // KPIs
  const totalAlunas = alunasFiltradas.length;
  const alunas_ativas = alunasFiltradas.filter(a => a.status === "Ativa").length;
  const percentualAtivas = totalAlunas > 0 ? (alunas_ativas / totalAlunas) * 100 : 0;
  const tempoBaseMedio = totalAlunas > 0
    ? alunasFiltradas.reduce((sum, a) => sum + calcularTempoBase(a.data_primeira_compra, a.status, a.data_inativacao), 0) / totalAlunas
    : 0;

  // Vendas
  const vendasFiltradas = vendas.filter(v => 
    alunasFiltradas.some(a => a.id === v.id_aluna)
  );
  
  const receitaTotal = vendasFiltradas.reduce((sum, v) => sum + v.valor_vendido, 0);
  const faturamentoPorAluna = totalAlunas > 0 ? receitaTotal / totalAlunas : 0;

  // Distribuição por status
  const statusData = [
    { name: "Ativa", value: alunas.filter(a => a.status === "Ativa").length },
    { name: "Inativa", value: alunas.filter(a => a.status === "Inativa").length },
  ];

  // Vendas por período
  const vendasPorPeriodo = vendas.reduce((acc, venda) => {
    const existing = acc.find(v => v.periodo === venda.periodo);
    if (existing) {
      existing.valor += venda.valor_vendido;
    } else {
      acc.push({ periodo: venda.periodo, valor: venda.valor_vendido });
    }
    return acc;
  }, [] as { periodo: string; valor: number }[])
  .sort((a, b) => a.periodo.localeCompare(b.periodo));

  // Vendas por produto
  const vendasPorProduto = vendas.reduce((acc, venda) => {
    venda.produtos.forEach(produto => {
      const existing = acc.find(p => p.produto === produto);
      if (existing) {
        existing.valor += venda.valor_vendido / venda.produtos.length;
      } else {
        acc.push({ produto, valor: venda.valor_vendido / venda.produtos.length });
      }
    });
    return acc;
  }, [] as { produto: string; valor: number }[])
  .sort((a, b) => b.valor - a.valor)
  .slice(0, 5);

  const exportarCSV = () => {
    const headers = ["Nome", "Email", "Status", "Cursos Concluídos", "Tempo Base", "Receita Total"];
    const rows = alunasFiltradas.map(aluna => {
      const vendasAluna = vendas.filter(v => v.id_aluna === aluna.id);
      const receitaAluna = vendasAluna.reduce((sum, v) => sum + v.valor_vendido, 0);
      return [
        aluna.nome,
        aluna.email,
        aluna.status,
        getCursosConcluidos(aluna),
        calcularTempoBase(aluna.data_primeira_compra, aluna.status, aluna.data_inativacao),
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-poppins font-extralight">
            Indicadores e Relatórios
          </h1>
          <p className="text-muted-foreground font-light">
            Análise completa de desempenho e vendas
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Ativa">Apenas Ativas</SelectItem>
              <SelectItem value="Inativa">Apenas Inativas</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportarCSV} className="btn-gradient">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.2 }}>
          <Card className="card-premium border-primary/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-light text-muted-foreground">Total de Alunas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-poppins font-semibold text-primary">{totalAlunas}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.2 }}>
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-sm font-light text-muted-foreground">% Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-poppins font-semibold text-success">{percentualAtivas.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground font-light mt-1">{alunas_ativas} de {totalAlunas}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.2 }}>
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-sm font-light text-muted-foreground">Tempo Base Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-poppins font-semibold">{Math.round(tempoBaseMedio)}</p>
              <p className="text-sm text-muted-foreground font-light">dias</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25, duration: 0.2 }}>
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="text-sm font-light text-muted-foreground">Faturamento/Aluna</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-poppins font-semibold text-secondary">
                R$ {faturamentoPorAluna.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribuição por Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.2 }}>
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="font-poppins font-light text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 300,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Receita Total */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.2 }}>
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="font-poppins font-light text-lg">Receita Total</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <p className="text-6xl font-poppins font-semibold text-primary">
                  R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-muted-foreground font-light mt-2">Período Total</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Evolução de Vendas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.2 }}>
        <Card className="card-premium mb-6">
          <CardHeader>
            <CardTitle className="font-poppins font-light text-lg">Evolução de Vendas por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
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
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 300,
                  }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 300 }} />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Valor Vendido"
                  dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vendas por Produto */}
      {vendasPorProduto.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.2 }}>
          <Card className="card-premium">
            <CardHeader>
              <CardTitle className="font-poppins font-light text-lg">Top 5 Produtos por Valor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={vendasPorProduto} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px', fontWeight: 300 }}
                  />
                  <YAxis 
                    dataKey="produto" 
                    type="category" 
                    width={150} 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px', fontWeight: 300 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 300,
                    }}
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                  <Bar 
                    dataKey="valor" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 8, 8, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

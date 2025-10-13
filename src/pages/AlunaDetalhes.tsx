import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAluna, useVendas } from "@/hooks/useAlunas";
import { useAlunoCursos } from "@/hooks/useCursos";
import { useObservacoesMentora } from "@/hooks/useObservacoesMentora";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, FileText, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { ObservacoesTableReadOnly } from "@/components/ObservacoesTableReadOnly";
import { AlunaDetalhesSkeleton } from "@/components/LoadingSkeletons";
import { calcularTempoBase } from "@/lib/utils";
import { exportToCSV, exportToPDF, shareFile } from "@/utils/fichaExportUtils";
import { toast } from "sonner";

export default function AlunaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: aluna, isLoading } = useAluna(Number(id));
  const { data: alunoCursos = [] } = useAlunoCursos(Number(id));
  const { data: vendas = [] } = useVendas(Number(id));
  const { data: observacoes = [] } = useObservacoesMentora(Number(id));
  const { data: profile } = useProfile();
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

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

  const cursosConcluidos = alunoCursos.filter(ac => ac.status_evolucao === 'concluido').length;
  const progressoCursos = alunoCursos.length > 0
    ? (cursosConcluidos / alunoCursos.length) * 100
    : 0;

  const handleExportCSV = () => {
    if (!aluna) return;
    setIsExporting(true);
    try {
      exportToCSV(aluna, vendas, observacoes, [], alunoCursos);
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!aluna) return;
    setIsExporting(true);
    try {
      const pdfBlob = await exportToPDF(aluna, vendas, observacoes, [], cursosConcluidos, totalVendas, profile?.full_name || "Não informado", alunoCursos);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ficha_${aluna.nome.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!aluna) return;
    setIsSharing(true);
    try {
      const pdfBlob = await exportToPDF(aluna, vendas, observacoes, [], cursosConcluidos, totalVendas, profile?.full_name || "Não informado", alunoCursos);
      shareFile(pdfBlob, aluna);
    } catch (error) {
      toast.error("Erro ao preparar compartilhamento");
    } finally {
      setIsSharing(false);
    }
  };

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleShare} disabled={isSharing}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
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
                  {calcularTempoBase(aluna.data_cadastro, aluna.status, aluna.data_inativacao)} dias
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
              <span className="text-lg font-semibold">Cursos Adquiridos</span>
              <Badge variant="secondary">{alunoCursos.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                {alunoCursos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum curso adquirido</p>
                ) : (
                  alunoCursos.map((alunoCurso: any) => (
                    <div key={alunoCurso.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{alunoCurso.cursos?.nome || "Curso sem nome"}</p>
                        <p className="text-xs text-muted-foreground">
                          Adquirido em: {alunoCurso.data_compra ? new Date(alunoCurso.data_compra).toLocaleDateString('pt-BR') : 'Data não informada'}
                        </p>
                      </div>
                      <Badge variant={alunoCurso.status_evolucao === "concluido" ? "default" : "outline"}>
                        {alunoCurso.status_evolucao === "concluido" ? "Concluído" : 
                         alunoCurso.status_evolucao === "em_andamento" ? "Em andamento" :
                         alunoCurso.status_evolucao === "pausado" ? "Pausado" : "Não iniciado"}
                      </Badge>
                    </div>
                  ))
                )}
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

        <AccordionItem value="planos-observacoes" className="border rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Planos de Ação e Observações</span>
              <Badge variant="secondary">{observacoes.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <ObservacoesTableReadOnly idAluna={Number(id)} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}

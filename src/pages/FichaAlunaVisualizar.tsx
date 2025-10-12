import { useParams, useNavigate } from "react-router-dom";
import { useAluna, usePlanosAcao, useVendas, getCursosConcluidos } from "@/hooks/useAlunas";
import { useObservacoesMentora } from "@/hooks/useObservacoesMentora";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportToCSV, exportToPDF, shareFile } from "@/utils/fichaExportUtils";
import { calcularTempoBase } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export default function FichaAlunaVisualizar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: aluna, isLoading } = useAluna(Number(id));
  const { data: planos = [] } = usePlanosAcao(Number(id));
  const { data: vendas = [] } = useVendas(Number(id));
  const { data: observacoes = [] } = useObservacoesMentora(Number(id));
  
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!aluna) {
    return <div className="p-8">Aluno não encontrado</div>;
  }

  const cursosConcluidos = getCursosConcluidos(aluna);
  const totalVendas = vendas.reduce((sum, v) => sum + v.valor_vendido, 0);

  const handleExportCSV = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      await exportToCSV(aluna, vendas, observacoes, planos);
      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar CSV");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .single();
      
      const mentorName = profile?.full_name || 'N/A';
      const pdfBlob = await exportToPDF(aluna, vendas, observacoes, planos, cursosConcluidos, totalVendas, mentorName);
      
      // Download automático
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ficha_${aluna.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("PDF exportado com sucesso!");
      return pdfBlob;
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error(error);
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .single();
      
      const mentorName = profile?.full_name || 'N/A';
      // Primeiro gera o PDF
      const pdfBlob = await exportToPDF(aluna, vendas, observacoes, planos, cursosConcluidos, totalVendas, mentorName);
      
      if (!pdfBlob) {
        throw new Error("Erro ao gerar PDF");
      }
      
      // Mostra opções de compartilhamento
      await shareFile(pdfBlob, aluna);
      
    } catch (error) {
      toast.error("Erro ao compartilhar ficha");
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div id="ficha-aluna-print" className="p-8 max-w-5xl mx-auto">
      {/* Barra de Ações */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button
          variant="ghost"
          onClick={() => navigate(`/aluna/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          
          <Button
            onClick={handleShare}
            disabled={isSharing || isExporting}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="bg-card rounded-lg p-6 shadow-sm mb-6 border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white">
            {aluna.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{aluna.nome}</h1>
            <p className="text-sm text-muted-foreground">{aluna.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={aluna.status === "Ativa" ? "default" : "secondary"} className="ml-2">
              {aluna.status}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Tempo na Base:</span>
            <span className="ml-2 font-semibold">{calcularTempoBase(aluna.data_primeira_compra, aluna.status, aluna.data_inativacao)} dias</span>
          </div>
          <div>
            <span className="text-muted-foreground">Curso Atual:</span>
            <span className="ml-2 font-semibold">{aluna.curso_atual || "-"}</span>
          </div>
        </div>
      </div>

      {/* Cursos Adquiridos & Versões */}
      <div className="bg-card rounded-lg p-6 shadow-sm mb-6 border">
        <h2 className="text-lg font-semibold mb-4">Cursos Adquiridos</h2>
        <div className="space-y-2 mb-4">
          {aluna.cursos_adquiridos.length > 0 ? (
            aluna.cursos_adquiridos.map((curso, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
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
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum curso adquirido</p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {cursosConcluidos} de {aluna.cursos_adquiridos.length} cursos concluídos
        </p>
      </div>

      {/* Principais Dificuldades */}
      <div className="bg-card rounded-lg p-6 shadow-sm mb-6 border">
        <h2 className="text-lg font-semibold mb-4">Principais Dificuldades</h2>
        {aluna.principais_dificuldades && aluna.principais_dificuldades.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {aluna.principais_dificuldades.map((dif, idx) => (
              <li key={idx} className="text-sm">{dif}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma dificuldade registrada</p>
        )}
      </div>

      {/* Plano da Mentora */}
      <div className="bg-card rounded-lg p-6 shadow-sm mb-6 border">
        <h2 className="text-lg font-semibold mb-4">Plano da Mentora</h2>
        {observacoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-semibold">Plano de Ação</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Prazo</th>
                  <th className="pb-2 font-semibold">Observações</th>
                </tr>
              </thead>
              <tbody>
                {observacoes.map((obs) => (
                  <tr key={obs.id} className="border-b last:border-0">
                    <td className="py-2">{obs.plano_acao}</td>
                    <td className="py-2">
                      <Badge variant={
                        obs.status === 'em_andamento' ? 'default' :
                        obs.status === 'cancelado' ? 'destructive' :
                        obs.status === 'interrompido' ? 'secondary' :
                        'outline'
                      }>
                        {obs.status === 'em_andamento' ? 'Em Andamento' :
                         obs.status === 'cancelado' ? 'Cancelado' :
                         obs.status === 'interrompido' ? 'Interrompido' :
                         'Iniciado'}
                      </Badge>
                    </td>
                    <td className="py-2">{obs.prazo_execucao || "-"}</td>
                    <td className="py-2">{obs.observacoes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma observação registrada</p>
        )}
      </div>

      {/* Vendas */}
      <div className="bg-card rounded-lg p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Vendas</h2>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary">
              R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        
        {vendas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2 font-semibold">Período</th>
                  <th className="pb-2 font-semibold">Produtos</th>
                  <th className="pb-2 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr key={venda.id} className="border-b last:border-0">
                    <td className="py-2">{venda.periodo}</td>
                    <td className="py-2">
                      {venda.produtos.length > 0 ? venda.produtos.join(", ") : "-"}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      R$ {venda.valor_vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma venda registrada</p>
        )}
      </div>
    </div>
  );
}

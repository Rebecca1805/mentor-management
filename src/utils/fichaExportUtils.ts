import type { Aluna, Venda, PlanoAcao } from "@/hooks/useAlunas";
import type { ObservacaoMentora } from "@/hooks/useObservacoesMentora";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToCSV = async (
  aluna: Aluna,
  vendas: Venda[],
  observacoes: ObservacaoMentora[],
  planos: PlanoAcao[],
  alunoCursos: any[] = []
) => {
  const fileName = `ficha_${aluna.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Cabeçalho do CSV
  let csvContent = "Ficha do Aluno - MentorManagement\n\n";
  
  // Dados da Aluna
  csvContent += "INFORMAÇÕES BÁSICAS\n";
  csvContent += `Nome,${aluna.nome}\n`;
  csvContent += `Email,${aluna.email}\n`;
  csvContent += `Status,${aluna.status}\n`;
  csvContent += `Tempo na Base,${aluna.tempo_base} dias\n`;
  csvContent += `Curso Atual,${aluna.curso_atual || "-"}\n\n`;
  
  // Cursos Adquiridos
  csvContent += "CURSOS ADQUIRIDOS\n";
  csvContent += "Nome do Curso,Status\n";
  alunoCursos.forEach((alunoCurso: any) => {
    const status = alunoCurso.status_evolucao === 'concluido' ? 'Concluído' :
                   alunoCurso.status_evolucao === 'em_andamento' ? 'Em Andamento' :
                   alunoCurso.status_evolucao === 'pausado' ? 'Pausado' : 'Não Iniciado';
    csvContent += `${alunoCurso.cursos?.nome || 'Curso sem nome'},${status}\n`;
  });
  csvContent += "\n";
  
  // Dificuldades
  csvContent += "PRINCIPAIS DIFICULDADES\n";
  if (aluna.principais_dificuldades && aluna.principais_dificuldades.length > 0) {
    aluna.principais_dificuldades.forEach(dif => {
      csvContent += `"${dif}"\n`;
    });
  } else {
    csvContent += "Nenhuma dificuldade registrada\n";
  }
  csvContent += "\n";
  
  // Observações
  csvContent += "OBSERVAÇÕES DA MENTORA\n";
  csvContent += "Plano de Ação,Status,Prazo,Observações\n";
  observacoes.forEach(obs => {
    const status = obs.status === 'em_andamento' ? 'Em Andamento' :
                   obs.status === 'cancelado' ? 'Cancelado' :
                   obs.status === 'interrompido' ? 'Interrompido' : 'Iniciado';
    csvContent += `"${obs.plano_acao}",${status},${obs.prazo_execucao || "-"},"${obs.observacoes || "-"}"\n`;
  });
  csvContent += "\n";
  
  // Vendas
  const totalVendas = vendas.reduce((sum, v) => sum + v.valor_vendido, 0);
  csvContent += "VENDAS\n";
  csvContent += "Período,Produtos,Valor\n";
  vendas.forEach(venda => {
    const produtos = venda.produtos.join("; ");
    csvContent += `${venda.periodo},"${produtos}",R$ ${venda.valor_vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  });
  csvContent += `\nTOTAL,,"R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}"\n`;
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (
  aluna: Aluna,
  vendas: Venda[],
  observacoes: ObservacaoMentora[],
  planos: PlanoAcao[],
  cursosConcluidos: number,
  totalVendas: number,
  mentorName: string = "N/A",
  alunoCursos: any[] = [],
  chartImage: string | null = null
): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const dateTime = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
  
  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("MentorManagement", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Ficha do Aluno", pageWidth / 2, 28, { align: "center" });
  
  let yPos = 40;
  
  // Informações Básicas
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMAÇÕES BÁSICAS", 14, yPos);
  yPos += 8;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nome: ${aluna.nome}`, 14, yPos);
  yPos += 6;
  doc.text(`Email: ${aluna.email}`, 14, yPos);
  yPos += 6;
  doc.text(`Status: ${aluna.status}`, 14, yPos);
  yPos += 6;
  doc.text(`Tempo na Base: ${aluna.tempo_base} dias`, 14, yPos);
  yPos += 6;
  doc.text(`Curso Atual: ${aluna.curso_atual || "-"}`, 14, yPos);
  yPos += 6;
  doc.text(`Responsável: ${mentorName}`, 14, yPos);
  yPos += 10;
  
  // Cursos Adquiridos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CURSOS ADQUIRIDOS", 14, yPos);
  yPos += 8;
  
  if (alunoCursos.length > 0) {
    const cursosData = alunoCursos.map((alunoCurso: any) => {
      const status = alunoCurso.status_evolucao === 'concluido' ? 'Concluído' :
                     alunoCurso.status_evolucao === 'em_andamento' ? 'Em Andamento' :
                     alunoCurso.status_evolucao === 'pausado' ? 'Pausado' : 'Não Iniciado';
      return [alunoCurso.cursos?.nome || 'Curso sem nome', status];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Curso', 'Status']],
      body: cursosData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [100, 100, 100] },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${cursosConcluidos} de ${alunoCursos.length} cursos concluídos`, 14, yPos);
    yPos += 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Nenhum curso adquirido", 14, yPos);
    yPos += 10;
  }
  
  // Principais Dificuldades
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PRINCIPAIS DIFICULDADES", 14, yPos);
  yPos += 8;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (aluna.principais_dificuldades && aluna.principais_dificuldades.length > 0) {
    aluna.principais_dificuldades.forEach(dif => {
      const lines = doc.splitTextToSize(`• ${dif}`, pageWidth - 28);
      doc.text(lines, 14, yPos);
      yPos += lines.length * 5;
    });
  } else {
    doc.text("Nenhuma dificuldade registrada", 14, yPos);
    yPos += 6;
  }
  yPos += 8;
  
  // Observações
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("OBSERVAÇÕES DA MENTORA", 14, yPos);
  yPos += 8;
  
  if (observacoes.length > 0) {
    const obsData = observacoes.map(obs => {
      const status = obs.status === 'em_andamento' ? 'Em Andamento' :
                     obs.status === 'cancelado' ? 'Cancelado' :
                     obs.status === 'interrompido' ? 'Interrompido' : 'Iniciado';
      return [
        obs.plano_acao,
        status,
        obs.prazo_execucao || "-",
        obs.observacoes || "-"
      ];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Plano de Ação', 'Status', 'Prazo', 'Observações']],
      body: obsData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [100, 100, 100] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Nenhuma observação registrada", 14, yPos);
    yPos += 10;
  }
  
  // Vendas
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("VENDAS", 14, yPos);
  yPos += 8;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Total de Vendas: R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, yPos);
  yPos += 10;
  
  // Inserir gráfico se disponível
  if (chartImage) {
    const imageHeight = 80;
    if (yPos + imageHeight > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    try {
      doc.addImage(chartImage, 'PNG', 14, yPos, 180, imageHeight);
      yPos += imageHeight + 10;
    } catch (error) {
      console.error('Erro ao adicionar imagem ao PDF:', error);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Gráfico não disponível", 14, yPos);
      yPos += 10;
    }
  } else if (vendas.length > 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Gráfico de evolução de vendas", 14, yPos);
    yPos += 8;
    doc.setTextColor(0);
  }
  
  if (vendas.length > 0) {
    const vendasData = vendas.map(venda => [
      venda.periodo,
      venda.produtos.join(", "),
      `R$ ${venda.valor_vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Período', 'Produtos', 'Valor']],
      body: vendasData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [100, 100, 100] },
      columnStyles: {
        2: { halign: 'right' },
      },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 8;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `Total: R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      pageWidth - 14,
      yPos,
      { align: "right" }
    );
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Nenhuma venda registrada", 14, yPos);
  }
  
  // Rodapé em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(
      `Gerado em ${dateTime}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  return doc.output('blob');
};

export const shareFile = async (pdfBlob: Blob, aluna: Aluna) => {
  const fileName = `ficha_${aluna.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Criar URL temporária para o blob
  const url = URL.createObjectURL(pdfBlob);
  
  // Copiar link para clipboard
  try {
    await navigator.clipboard.writeText(url);
  } catch (err) {
    console.error("Erro ao copiar link:", err);
  }
  
  // Criar mensagem de compartilhamento
  const message = `Ficha da Aluna - ${aluna.nome}\nVeja os detalhes no arquivo PDF anexo.`;
  
  // WhatsApp - abre com mensagem
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + '\n\nBaixe o PDF primeiro e anexe manualmente.')}`;
  
  // Email - abre cliente de email
  const emailSubject = `Ficha da Aluna - ${aluna.nome}`;
  const emailBody = `${message}\n\nBaixe o PDF primeiro e anexe manualmente ao email.`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  
  // Criar dialog customizado com opções
  const dialogHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 24px; border-radius: 8px; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: bold;">Compartilhar Ficha</h3>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">O PDF foi gerado. Escolha como deseja compartilhar:</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button id="download-btn" style="padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
            📥 Baixar PDF
          </button>
          <button id="whatsapp-btn" style="padding: 12px; background: #25d366; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
            📱 Compartilhar via WhatsApp
          </button>
          <button id="email-btn" style="padding: 12px; background: #ea4335; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
            📧 Compartilhar via Email
          </button>
          <button id="close-btn" style="padding: 12px; background: #e5e7eb; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
            Fechar
          </button>
        </div>
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #999;">Nota: Você precisará anexar o PDF manualmente no WhatsApp/Email.</p>
      </div>
    </div>
  `;
  
  const dialog = document.createElement('div');
  dialog.innerHTML = dialogHTML;
  document.body.appendChild(dialog);
  
  // Handlers
  const downloadBtn = dialog.querySelector('#download-btn');
  const whatsappBtn = dialog.querySelector('#whatsapp-btn');
  const emailBtn = dialog.querySelector('#email-btn');
  const closeBtn = dialog.querySelector('#close-btn');
  
  downloadBtn?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    document.body.removeChild(dialog);
    URL.revokeObjectURL(url);
  });
  
  whatsappBtn?.addEventListener('click', () => {
    window.open(whatsappUrl, '_blank');
    document.body.removeChild(dialog);
    URL.revokeObjectURL(url);
  });
  
  emailBtn?.addEventListener('click', () => {
    window.location.href = emailUrl;
    document.body.removeChild(dialog);
    URL.revokeObjectURL(url);
  });
  
  closeBtn?.addEventListener('click', () => {
    document.body.removeChild(dialog);
    URL.revokeObjectURL(url);
  });
};

import { jsPDF } from "jspdf";
import { Aluna, getCursosConcluidos } from "@/hooks/useAlunas";
import { Venda } from "@/hooks/useAlunas";
import { ObservacaoMentora } from "@/hooks/useObservacoesMentora";

const STATUS_LABELS = {
  iniciado: "Iniciado",
  em_andamento: "Em Andamento",
  cancelado: "Cancelado",
  interrompido: "Interrompido",
};

const CURSO_STATUS_LABELS = {
  nao_iniciado: "Não Iniciado",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  concluido: "Concluído",
};

// Import autoTable separately to avoid bundling issues
const loadAutoTable = async () => {
  const autoTableModule = await import("jspdf-autotable");
  return autoTableModule.default;
};

export const exportToPDF = async (
  aluna: Aluna,
  vendas: Venda[],
  observacoes: ObservacaoMentora[]
) => {
  const autoTable = await loadAutoTable();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Ficha da Aluna", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Informações Básicas
  doc.setFont("helvetica", "bold");
  doc.text("Informações Básicas", 14, yPosition);
  yPosition += 8;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nome: ${aluna.nome}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Email: ${aluna.email}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Status: ${aluna.status}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Tempo na Base: ${aluna.tempo_base} dias`, 14, yPosition);
  yPosition += 6;
  if (aluna.curso_atual) {
    doc.text(`Curso Atual: ${aluna.curso_atual}`, 14, yPosition);
    yPosition += 6;
  }
  
  yPosition += 5;

  // Cursos Adquiridos
  if (aluna.cursos_adquiridos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Cursos Adquiridos", 14, yPosition);
    yPosition += 8;

    const cursosData = aluna.cursos_adquiridos.map((curso) => [
      curso.nome,
      CURSO_STATUS_LABELS[curso.status],
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Curso", "Status"]],
      body: cursosData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Principais Dificuldades
  if (aluna.principais_dificuldades.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Principais Dificuldades", 14, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    aluna.principais_dificuldades.forEach((dif) => {
      doc.text(`• ${dif}`, 14, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
  }

  // Observações da Mentora
  if (observacoes.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Observações da Mentora", 14, yPosition);
    yPosition += 8;

    const obsData = observacoes.map((obs) => [
      obs.plano_acao,
      obs.prazo_execucao ? new Date(obs.prazo_execucao).toLocaleDateString("pt-BR") : "-",
      STATUS_LABELS[obs.status],
      obs.observacoes || "-",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Plano de Ação", "Prazo", "Status", "Observações"]],
      body: obsData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 60 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Vendas
  if (vendas.length > 0) {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Vendas", 14, yPosition);
    yPosition += 8;

    const totalVendas = vendas.reduce((sum, v) => sum + v.valor_vendido, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Total de Vendas: R$ ${totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      14,
      yPosition
    );
    yPosition += 8;

    const vendasData = vendas.map((venda) => [
      venda.periodo,
      venda.produtos.join(", ") || "-",
      `R$ ${venda.valor_vendido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Período", "Produtos", "Valor"]],
      body: vendasData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 90 },
        2: { cellWidth: 40, halign: "right" },
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  doc.save(`ficha-${aluna.nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
};

export const exportToCSV = (
  aluna: Aluna,
  vendas: Venda[],
  observacoes: ObservacaoMentora[]
) => {
  const cursosConcluidos = getCursosConcluidos(aluna);
  const totalVendas = vendas.reduce((sum, v) => sum + v.valor_vendido, 0);

  // Header - Informações da Aluna
  const headers = [
    "INFORMAÇÕES DA ALUNA",
    "",
    "",
    "",
    "",
  ];

  const alunaInfo = [
    ["Nome", aluna.nome, "", "", ""],
    ["Email", aluna.email, "", "", ""],
    ["Status", aluna.status, "", "", ""],
    ["Tempo na Base (dias)", aluna.tempo_base.toString(), "", "", ""],
    ["Curso Atual", aluna.curso_atual || "-", "", "", ""],
    ["Cursos Concluídos", `${cursosConcluidos} de ${aluna.cursos_adquiridos.length}`, "", "", ""],
    ["", "", "", "", ""],
  ];

  // Cursos Adquiridos
  const cursosHeader = [
    "CURSOS ADQUIRIDOS",
    "Status",
    "",
    "",
    "",
  ];

  const cursosData = aluna.cursos_adquiridos.map((curso) => [
    curso.nome,
    CURSO_STATUS_LABELS[curso.status],
    "",
    "",
    "",
  ]);

  const cursosSection = [cursosHeader, ...cursosData, ["", "", "", "", ""]];

  // Principais Dificuldades
  const dificuldadesHeader = ["PRINCIPAIS DIFICULDADES", "", "", "", ""];
  const dificuldadesData = aluna.principais_dificuldades.map((dif) => [
    dif,
    "",
    "",
    "",
    "",
  ]);
  const dificuldadesSection = [
    dificuldadesHeader,
    ...dificuldadesData,
    ["", "", "", "", ""],
  ];

  // Observações da Mentora
  const observacoesHeader = [
    "OBSERVAÇÕES DA MENTORA",
    "Prazo",
    "Status",
    "Observações",
    "",
  ];

  const observacoesData = observacoes.map((obs) => [
    obs.plano_acao,
    obs.prazo_execucao ? new Date(obs.prazo_execucao).toLocaleDateString("pt-BR") : "-",
    STATUS_LABELS[obs.status],
    obs.observacoes || "-",
    "",
  ]);

  const observacoesSection = [
    observacoesHeader,
    ...observacoesData,
    ["", "", "", "", ""],
  ];

  // Vendas
  const vendasHeader = [
    "VENDAS",
    "Produtos",
    "Valor",
    "",
    "",
  ];

  const vendasData = vendas.map((venda) => [
    venda.periodo,
    venda.produtos.join("; ") || "-",
    venda.valor_vendido.toFixed(2),
    "",
    "",
  ]);

  const totalVendasRow = [
    "TOTAL",
    "",
    totalVendas.toFixed(2),
    "",
    "",
  ];

  const vendasSection = [
    vendasHeader,
    ...vendasData,
    totalVendasRow,
  ];

  // Combinar todas as seções
  const allRows = [
    headers,
    ...alunaInfo,
    ...cursosSection,
    ...dificuldadesSection,
    ...observacoesSection,
    ...vendasSection,
  ];

  // Converter para CSV
  const csvContent = allRows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Adicionar BOM para UTF-8
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ficha-${aluna.nome.replace(/\s+/g, "-").toLowerCase()}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

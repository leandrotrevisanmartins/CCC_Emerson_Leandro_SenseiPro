import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Tipos ────────────────────────────────────────────────────────────────
export interface MensalidadeRelatorio {
  id_mensalidade?: number;
  aluno: { nome: string };
  mes_referencia: string;
  valor: number;
  data_vencimento: string;
  status: string;
}

export interface PresencaRelatorio {
  id_presenca?: number;
  data: string;
  presente: boolean;
  aluno: { nome: string };
  turma: { nome: string; modalidade?: { nome: string } };
}

// ─── Cabeçalho padrão ─────────────────────────────────────────────────────
function adicionarCabecalho(doc: jsPDF, titulo: string) {
  doc.setFillColor(30, 30, 50);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("SenseiPro", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestão de Academia", 14, 21);

  const agora = new Date();
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 196, 14, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Emitido em: ${agora.toLocaleDateString("pt-BR")} às ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    196, 21, { align: "right" }
  );
}

// ─── Rodapé com paginação ─────────────────────────────────────────────────
function adicionarRodape(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(200, 200, 200);
    doc.line(14, h - 15, 196, h - 15);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("SenseiPro — Sistema de Gestão de Academia de Artes Marciais", 14, h - 9);
    doc.text(`Página ${i} de ${pageCount}`, 196, h - 9, { align: "right" });
  }
}

// ─── Card de resumo ───────────────────────────────────────────────────────
function adicionarCardResumo(
  doc: jsPDF,
  y: number,
  itens: { label: string; valor: string; cor?: [number, number, number] }[]
) {
  doc.setFillColor(245, 245, 250);
  doc.rect(14, y, 182, 24, "F");
  const largura = 182 / itens.length;

  itens.forEach((item, i) => {
    const x = 14 + i * largura + 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(item.label, x, y + 8);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    const cor = item.cor || [30, 30, 50];
    doc.setTextColor(cor[0], cor[1], cor[2]);
    doc.text(item.valor, x, y + 18);
  });

  doc.setTextColor(0, 0, 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// RELATÓRIO 1 — MENSALIDADES PENDENTES
// ═══════════════════════════════════════════════════════════════════════════
export function gerarRelatorioPendentes(mensalidades: MensalidadeRelatorio[]) {
  const doc = new jsPDF();
  const agora = new Date();

  adicionarCabecalho(doc, "RELATÓRIO DE MENSALIDADES PENDENTES");

  const totalValor = mensalidades.reduce((acc, m) => acc + Number(m.valor), 0);
  const atrasadas = mensalidades.filter(m => m.status === "atrasado").length;
  const pendentes = mensalidades.filter(m => m.status === "pendente").length;
  const alunosUnicos = new Set(mensalidades.map(m => m.aluno.nome)).size;

  adicionarCardResumo(doc, 35, [
    { label: "Total de registros", valor: String(mensalidades.length) },
    { label: "Alunos afetados",    valor: String(alunosUnicos) },
    { label: "Pendentes",          valor: String(pendentes), cor: [150, 110, 0] },
    { label: "Em atraso",          valor: String(atrasadas), cor: [180, 60, 60] },
    { label: "Valor em aberto",    valor: `R$ ${totalValor.toFixed(2)}`, cor: [30, 100, 30] },
  ]);

  const statusLabel: Record<string, string> = { pendente: "Pendente", atrasado: "Em Atraso" };

  autoTable(doc, {
    startY: 64,
    head: [["#", "Aluno", "Mês de Referência", "Valor (R$)", "Vencimento", "Status"]],
    body: mensalidades.map((m, i) => [
      String(i + 1),
      m.aluno.nome,
      m.mes_referencia,
      Number(m.valor).toFixed(2),
      new Date(m.data_vencimento).toLocaleDateString("pt-BR"),
      statusLabel[m.status] || m.status,
    ]),
    headStyles: { fillColor: [30, 30, 50], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      3: { halign: "right" },
      4: { halign: "center" },
      5: { halign: "center" },
    },
  });

  adicionarRodape(doc);

  const nomeArquivo = `mensalidades_pendentes_${agora.toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeArquivo);
}

// ═══════════════════════════════════════════════════════════════════════════
// RELATÓRIO 2 — PRESENÇAS POR TURMA
// ═══════════════════════════════════════════════════════════════════════════
export function gerarRelatorioPresencasTurma(
  presencas: PresencaRelatorio[],
  nomeTurma: string,
  nomeModalidade?: string
) {
  const doc = new jsPDF();
  const agora = new Date();

  adicionarCabecalho(doc, "RELATÓRIO DE PRESENÇAS POR TURMA");

  // Subtítulo com nome da turma
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Turma: ${nomeTurma}${nomeModalidade ? ` — ${nomeModalidade}` : ""}`, 14, 36);

  // ── Calcular totais por aluno ──────────────────────────────────────────
  const porAluno: Record<string, { presentes: number; ausentes: number }> = {};
  presencas.forEach(p => {
    const nome = p.aluno.nome;
    if (!porAluno[nome]) porAluno[nome] = { presentes: 0, ausentes: 0 };
    if (p.presente) porAluno[nome].presentes++;
    else porAluno[nome].ausentes++;
  });

  const totalAulas = new Set(presencas.map(p => p.data)).size;
  const totalRegistros = presencas.length;
  const totalPresentes = presencas.filter(p => p.presente).length;
  const percentualGeral = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0;
  const nomeAlunos = Object.keys(porAluno).length;

  adicionarCardResumo(doc, 42, [
    { label: "Aulas registradas",   valor: String(totalAulas) },
    { label: "Total de registros",  valor: String(totalRegistros) },
    { label: "Alunos",              valor: String(nomeAlunos) },
    { label: "Presenças",           valor: String(totalPresentes), cor: [30, 100, 30] },
    { label: "Frequência geral",    valor: `${percentualGeral}%`,
      cor: percentualGeral >= 75 ? [30, 100, 30] : [180, 60, 60] },
  ]);

  // ── Seção 1: Resumo por aluno ──────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 50);
  doc.text("Frequência por Aluno", 14, 73);

  autoTable(doc, {
    startY: 76,
    head: [["Aluno", "Presenças", "Faltas", "Total", "Frequência %"]],
    body: Object.entries(porAluno).map(([nome, dados]) => {
      const total = dados.presentes + dados.ausentes;
      const freq = total > 0 ? Math.round((dados.presentes / total) * 100) : 0;
      return [nome, String(dados.presentes), String(dados.ausentes), String(total), `${freq}%`];
    }),
    headStyles: { fillColor: [30, 30, 50], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
    didParseCell: (data) => {
      // Colore a frequência: verde >= 75%, vermelho < 75%
      if (data.section === "body" && data.column.index === 4) {
        const freq = parseInt(String(data.cell.raw));
        data.cell.styles.textColor = freq >= 75 ? [30, 100, 30] : [180, 60, 60];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ── Seção 2: Registro detalhado por data ──────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 50);
  doc.text("Registro Detalhado por Aula", 14, finalY);

  // Agrupa por data
  const porData: Record<string, PresencaRelatorio[]> = {};
  presencas.forEach(p => {
    const data = new Date(p.data).toLocaleDateString("pt-BR");
    if (!porData[data]) porData[data] = [];
    porData[data].push(p);
  });

  const linhasDetalhadas: string[][] = [];
  Object.entries(porData)
    .sort(([a], [b]) => {
      const [da, ma, ya] = a.split("/").map(Number);
      const [db, mb, yb] = b.split("/").map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    })
    .forEach(([data, lista]) => {
      const presentes = lista.filter(p => p.presente).map(p => p.aluno.nome).join(", ") || "—";
      const ausentes = lista.filter(p => !p.presente).map(p => p.aluno.nome).join(", ") || "Nenhum";
      linhasDetalhadas.push([
        data,
        String(lista.filter(p => p.presente).length),
        String(lista.filter(p => !p.presente).length),
        presentes,
      ]);
    });

  autoTable(doc, {
    startY: finalY + 3,
    head: [["Data", "Presentes", "Faltas", "Alunos presentes"]],
    body: linhasDetalhadas,
    headStyles: { fillColor: [30, 30, 50], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    columnStyles: {
      0: { halign: "center", cellWidth: 22 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "center", cellWidth: 18 },
      3: { cellWidth: "auto" as any },
    },
  });

  adicionarRodape(doc);

  const nomeArquivo = `presencas_${nomeTurma.replace(/\s+/g, "_").toLowerCase()}_${agora.toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeArquivo);
}

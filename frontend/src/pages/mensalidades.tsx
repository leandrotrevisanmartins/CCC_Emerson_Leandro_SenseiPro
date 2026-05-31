import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col, Nav } from "react-bootstrap";
import { MensalidadeInterface, AlunoInterface } from "./interfaces";
import { mensalidadeService, pagamentoService, alunoService } from "./services";
import { gerarRelatorioPendentes } from "./utils/gerarRelatorioPDF";

const statusVariant: Record<string, string> = {
  pendente: "warning",
  pago: "success",
  atrasado: "danger",
};

export default function Mensalidades() {
  const [mensalidades, setMensalidades] = useState<MensalidadeInterface[]>([]);
  const [inadimplentes, setInadimplentes] = useState<MensalidadeInterface[]>([]);
  const [alunos, setAlunos] = useState<AlunoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInad, setLoadingInad] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aba, setAba] = useState<"todas" | "pendentes" | "inadimplentes">("todas");

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<MensalidadeInterface | null>(null);
  const [form, setForm] = useState({ id_aluno: 0, mes_referencia: "", valor: "", data_vencimento: "" });
  const [salvando, setSalvando] = useState(false);

  const [showPagModal, setShowPagModal] = useState(false);
  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState<MensalidadeInterface | null>(null);
  const [pagForm, setPagForm] = useState({ valor_pago: "", forma_pagamento: "PIX" });

  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroAluno, setFiltroAluno] = useState("");

  const carregar = async () => {
    try {
      setLoading(true);
      const [m, a] = await Promise.all([mensalidadeService.getAll(), alunoService.getAll()]);
      setMensalidades(m);
      setAlunos(a);
    } catch { setErro("Erro ao carregar mensalidades."); }
    finally { setLoading(false); }
  };

  const carregarInadimplentes = async () => {
    try {
      setLoadingInad(true);
      setInadimplentes(await mensalidadeService.getInadimplentes());
    } catch { setErro("Erro ao carregar inadimplentes."); }
    finally { setLoadingInad(false); }
  };

  useEffect(() => { carregar(); }, []);

  const mudarAba = (novaAba: "todas" | "pendentes" | "inadimplentes") => {
    setAba(novaAba);
    if (novaAba === "inadimplentes" && inadimplentes.length === 0) carregarInadimplentes();
  };

  const abrirNova = () => {
    setEditando(null);
    setForm({ id_aluno: 0, mes_referencia: "", valor: "", data_vencimento: "" });
    setShowModal(true);
  };

  const abrirEdicao = (m: MensalidadeInterface) => {
    setEditando(m);
    setForm({
      id_aluno: m.aluno.id_aluno || 0,
      mes_referencia: m.mes_referencia,
      valor: String(m.valor),
      data_vencimento: m.data_vencimento.slice(0, 10),
    });
    setShowModal(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_aluno) { setErro("Selecione um aluno."); return; }
    setSalvando(true);
    try {
      if (editando?.id_mensalidade) {
        await mensalidadeService.update(editando.id_mensalidade, {
          mes_referencia: form.mes_referencia,
          valor: parseFloat(form.valor),
          data_vencimento: form.data_vencimento as any,
        });
        setSucesso("Mensalidade atualizada.");
      } else {
        await mensalidadeService.create({ ...form, valor: parseFloat(form.valor), id_aluno: form.id_aluno });
        setSucesso("Mensalidade criada.");
      }
      setShowModal(false);
      carregar();
      if (aba === "inadimplentes") carregarInadimplentes();
    } catch { setErro("Erro ao salvar mensalidade."); }
    finally { setSalvando(false); }
  };

  const abrirPagamento = (m: MensalidadeInterface) => {
    setMensalidadeSelecionada(m);
    setPagForm({ valor_pago: String(m.valor), forma_pagamento: "PIX" });
    setShowPagModal(true);
  };

  const registrarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensalidadeSelecionada) return;
    setSalvando(true);
    try {
      await pagamentoService.create({
        id_mensalidade: mensalidadeSelecionada.id_mensalidade!,
        valor_pago: parseFloat(pagForm.valor_pago),
        forma_pagamento: pagForm.forma_pagamento,
      });
      setShowPagModal(false);
      setSucesso("Pagamento registrado.");
      carregar();
      if (aba === "inadimplentes") carregarInadimplentes();
    } catch { setErro("Erro ao registrar pagamento."); }
    finally { setSalvando(false); }
  };

  const excluir = async (id: number) => {
    if (!confirm("Excluir esta mensalidade?")) return;
    try {
      await mensalidadeService.delete(id);
      setSucesso("Mensalidade excluída.");
      carregar();
      if (aba === "inadimplentes") carregarInadimplentes();
    } catch { setErro("Erro ao excluir mensalidade."); }
  };

  const marcarAtrasado = async (m: MensalidadeInterface) => {
    try {
      await mensalidadeService.update(m.id_mensalidade!, { status: "atrasado" });
      carregar();
      if (aba === "inadimplentes") carregarInadimplentes();
    } catch { setErro("Erro ao atualizar status."); }
  };

  // Gera PDF com as mensalidades pendentes/atrasadas
  const gerarPDF = async () => {
    setGerandoPDF(true);
    try {
      let lista = mensalidades.filter(m => m.status !== "pago");
      // Se estiver na aba inadimplentes, usa só os atrasados
      if (aba === "inadimplentes") {
        lista = inadimplentes.length > 0 ? inadimplentes : await mensalidadeService.getInadimplentes();
      }
      if (lista.length === 0) {
        setSucesso("Não há mensalidades pendentes para gerar o relatório.");
        return;
      }
      gerarRelatorioPendentes(lista);
      setSucesso(`PDF gerado com ${lista.length} mensalidade(s).`);
    } catch { setErro("Erro ao gerar PDF."); }
    finally { setGerandoPDF(false); }
  };

  const filtradas = mensalidades.filter(m => {
    if (filtroStatus && m.status !== filtroStatus) return false;
    if (filtroAluno && !m.aluno.nome.toLowerCase().includes(filtroAluno.toLowerCase())) return false;
    return true;
  });

  const pendentes = mensalidades.filter(m => m.status !== "pago");
  const totalPendente = pendentes.reduce((acc, m) => acc + Number(m.valor), 0);
  const totalInadimplente = inadimplentes.reduce((acc, m) => acc + Number(m.valor), 0);
  const alunosUnicos = new Set(inadimplentes.map(m => m.aluno.id_aluno)).size;

  const TabelaMensalidades = ({ lista, comEdicao = false }: { lista: MensalidadeInterface[]; comEdicao?: boolean }) => (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr><th>#</th><th>Aluno</th><th>Mês</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr>
      </thead>
      <tbody>
        {lista.length === 0 ? (
          <tr><td colSpan={7} className="text-center text-muted py-4">Nenhuma mensalidade encontrada.</td></tr>
        ) : lista.map(m => (
          <tr key={m.id_mensalidade}>
            <td>{m.id_mensalidade}</td>
            <td>{m.aluno.nome}</td>
            <td>{m.mes_referencia}</td>
            <td>R$ {Number(m.valor).toFixed(2)}</td>
            <td>{new Date(m.data_vencimento).toLocaleDateString("pt-BR")}</td>
            <td><Badge bg={statusVariant[m.status]}>{m.status}</Badge></td>
            <td>
              {m.status !== "pago" && (
                <Button size="sm" variant="outline-success" className="me-1" onClick={() => abrirPagamento(m)}>Pagar</Button>
              )}
              {m.status === "pendente" && (
                <Button size="sm" variant="outline-warning" className="me-1" onClick={() => marcarAtrasado(m)}>Atrasar</Button>
              )}
              {comEdicao && (
                <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(m)}>Editar</Button>
              )}
              <Button size="sm" variant="outline-danger" onClick={() => excluir(m.id_mensalidade!)}>Excluir</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="fw-bold mb-0">💰 Mensalidades</h4>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={gerarPDF}
            disabled={gerandoPDF || loading}
          >
            {gerandoPDF ? "Gerando..." : "📄 Gerar PDF Pendentes"}
          </Button>
          <Button variant="dark" size="sm" onClick={abrirNova}>+ Nova Mensalidade</Button>
        </Col>
      </Row>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
      {sucesso && <Alert variant="success" dismissible onClose={() => setSucesso("")}>{sucesso}</Alert>}

      {/* Abas */}
      <Nav variant="tabs" className="mb-3">
        <Nav.Item>
          <Nav.Link active={aba === "todas"} onClick={() => mudarAba("todas")} style={{ cursor: "pointer" }}>
            Todas
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={aba === "pendentes"} onClick={() => mudarAba("pendentes")} style={{ cursor: "pointer" }}>
            Pendentes
            {pendentes.length > 0 && <Badge bg="warning" text="dark" className="ms-2">{pendentes.length}</Badge>}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={aba === "inadimplentes"} onClick={() => mudarAba("inadimplentes")} style={{ cursor: "pointer" }}>
            Inadimplentes
            {inadimplentes.length > 0 && <Badge bg="danger" className="ms-2">{inadimplentes.length}</Badge>}
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* ── Aba: Todas ── */}
      {aba === "todas" && (
        <>
          <Row className="mb-3 g-2">
            <Col sm={4}>
              <Form.Control type="text" placeholder="Buscar por aluno..." value={filtroAluno}
                onChange={e => setFiltroAluno(e.target.value)} />
            </Col>
            <Col sm={3}>
              <Form.Select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
              </Form.Select>
            </Col>
            {(filtroAluno || filtroStatus) && (
              <Col xs="auto">
                <Button variant="outline-secondary" size="sm" onClick={() => { setFiltroAluno(""); setFiltroStatus(""); }}>
                  Limpar
                </Button>
              </Col>
            )}
          </Row>
          {loading ? <div className="text-center py-5"><Spinner animation="border" /></div>
            : <TabelaMensalidades lista={filtradas} comEdicao />}
        </>
      )}

      {/* ── Aba: Pendentes ── */}
      {aba === "pendentes" && (
        <>
          {!loading && pendentes.length > 0 && (
            <Row className="g-3 mb-4">
              <Col xs={12} sm={4}>
                <div style={{ background: "var(--color-background-warning)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: 500, color: "var(--color-text-warning)" }}>{pendentes.length}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>mensalidades pendentes</div>
                </div>
              </Col>
              <Col xs={12} sm={4}>
                <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: 500 }}>R$ {totalPendente.toFixed(2)}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>valor total em aberto</div>
                </div>
              </Col>
            </Row>
          )}
          {loading ? <div className="text-center py-5"><Spinner animation="border" /></div>
            : pendentes.length === 0
              ? <div className="text-center py-5"><div style={{ fontSize: "2rem" }}>✅</div><p className="text-muted mt-2">Nenhuma mensalidade pendente.</p></div>
              : <TabelaMensalidades lista={pendentes} comEdicao />}
        </>
      )}

      {/* ── Aba: Inadimplentes ── */}
      {aba === "inadimplentes" && (
        <>
          {loadingInad ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
            <>
              {inadimplentes.length > 0 && (
                <Row className="g-3 mb-4">
                  <Col xs={12} sm={4}>
                    <div style={{ background: "var(--color-background-danger)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 500, color: "var(--color-text-danger)" }}>{inadimplentes.length}</div>
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>mensalidades em atraso</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 500 }}>{alunosUnicos}</div>
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>alunos inadimplentes</div>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div style={{ background: "var(--color-background-warning)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: 500, color: "var(--color-text-warning)" }}>R$ {totalInadimplente.toFixed(2)}</div>
                      <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>valor total em atraso</div>
                    </div>
                  </Col>
                </Row>
              )}
              {inadimplentes.length === 0
                ? <div className="text-center py-5"><div style={{ fontSize: "2rem" }}>✅</div><p className="text-muted mt-2">Nenhum inadimplente.</p></div>
                : <TabelaMensalidades lista={inadimplentes} />}
              <div className="mt-2">
                <Button variant="outline-secondary" size="sm" onClick={carregarInadimplentes}>Atualizar</Button>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal nova/editar mensalidade */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title>{editando ? "Editar Mensalidade" : "Nova Mensalidade"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Aluno *</Form.Label>
              <Form.Select required value={form.id_aluno}
                onChange={e => setForm({ ...form, id_aluno: Number(e.target.value) })}
                disabled={!!editando}>
                <option value={0}>Selecione...</option>
                {alunos.map(a => <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mês de Referência *</Form.Label>
              <Form.Control required placeholder="Ex: Junho/2026" value={form.mes_referencia}
                onChange={e => setForm({ ...form, mes_referencia: e.target.value })} />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Valor (R$) *</Form.Label>
                  <Form.Control required type="number" step="0.01" value={form.valor}
                    onChange={e => setForm({ ...form, valor: e.target.value })} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Vencimento *</Form.Label>
                  <Form.Control required type="date" value={form.data_vencimento}
                    onChange={e => setForm({ ...form, data_vencimento: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="dark" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal registrar pagamento */}
      <Modal show={showPagModal} onHide={() => setShowPagModal(false)}>
        <Form onSubmit={registrarPagamento}>
          <Modal.Header closeButton><Modal.Title>Registrar Pagamento</Modal.Title></Modal.Header>
          <Modal.Body>
            <p className="text-muted mb-3">
              <strong>{mensalidadeSelecionada?.mes_referencia}</strong> — {mensalidadeSelecionada?.aluno?.nome}
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Valor Pago (R$) *</Form.Label>
              <Form.Control required type="number" step="0.01" value={pagForm.valor_pago}
                onChange={e => setPagForm({ ...pagForm, valor_pago: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Forma de Pagamento *</Form.Label>
              <Form.Select value={pagForm.forma_pagamento}
                onChange={e => setPagForm({ ...pagForm, forma_pagamento: e.target.value })}>
                <option>PIX</option>
                <option>Dinheiro</option>
                <option>Cartão de Débito</option>
                <option>Cartão de Crédito</option>
                <option>Transferência</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPagModal(false)}>Cancelar</Button>
            <Button variant="success" type="submit" disabled={salvando}>{salvando ? "Registrando..." : "Confirmar Pagamento"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

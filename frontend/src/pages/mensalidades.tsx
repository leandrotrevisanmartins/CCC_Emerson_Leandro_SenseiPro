import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col } from "react-bootstrap";
import { MensalidadeInterface, AlunoInterface } from "./interfaces";
import { mensalidadeService, pagamentoService, alunoService } from "./services";

const statusVariant: Record<string, string> = { pendente: "warning", pago: "success", atrasado: "danger" };

export default function Mensalidades() {
  const [mensalidades, setMensalidades] = useState<MensalidadeInterface[]>([]);
  const [alunos, setAlunos] = useState<AlunoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPagModal, setShowPagModal] = useState(false);
  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState<MensalidadeInterface | null>(null);
  const [form, setForm] = useState({ id_aluno: 0, mes_referencia: "", valor: "", data_vencimento: "" });
  const [pagForm, setPagForm] = useState({ valor_pago: "", forma_pagamento: "PIX" });
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      const [m, a] = await Promise.all([mensalidadeService.getAll(), alunoService.getAll()]);
      setMensalidades(m);
      setAlunos(a);
    } catch {
      setErro("Erro ao carregar mensalidades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_aluno) { setErro("Selecione um aluno."); return; }
    setSalvando(true);
    try {
      await mensalidadeService.create({ ...form, valor: parseFloat(form.valor), id_aluno: form.id_aluno });
      setShowModal(false);
      carregar();
    } catch {
      setErro("Erro ao criar mensalidade.");
    } finally {
      setSalvando(false);
    }
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
      carregar();
    } catch {
      setErro("Erro ao registrar pagamento.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="fw-bold mb-0">💰 Mensalidades</h4></Col>
        <Col xs="auto">
          <Button variant="dark" size="sm" onClick={() => { setForm({ id_aluno: 0, mes_referencia: "", valor: "", data_vencimento: "" }); setShowModal(true); }}>
            + Nova Mensalidade
          </Button>
        </Col>
      </Row>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Aluno</th><th>Mês</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {mensalidades.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted">Nenhuma mensalidade cadastrada.</td></tr>
            ) : mensalidades.map(m => (
              <tr key={m.id_mensalidade}>
                <td>{m.id_mensalidade}</td>
                <td>{m.aluno.nome}</td>
                <td>{m.mes_referencia}</td>
                <td>R$ {Number(m.valor).toFixed(2)}</td>
                <td>{new Date(m.data_vencimento).toLocaleDateString("pt-BR")}</td>
                <td><Badge bg={statusVariant[m.status]}>{m.status}</Badge></td>
                <td>
                  {m.status !== "pago" && (
                    <Button size="sm" variant="outline-success" className="me-1"
                      onClick={() => { setMensalidadeSelecionada(m); setPagForm({ valor_pago: String(m.valor), forma_pagamento: "PIX" }); setShowPagModal(true); }}>
                      Pagar
                    </Button>
                  )}
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (!confirm("Excluir mensalidade?")) return;
                    try { await mensalidadeService.delete(m.id_mensalidade!); carregar(); }
                    catch { setErro("Erro ao excluir."); }
                  }}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton><Modal.Title>Nova Mensalidade</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Aluno *</Form.Label>
              <Form.Select required value={form.id_aluno} onChange={e => setForm({ ...form, id_aluno: Number(e.target.value) })}>
                <option value={0}>Selecione...</option>
                {alunos.map(a => <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mês de Referência *</Form.Label>
              <Form.Control required placeholder="Ex: Maio/2026" value={form.mes_referencia} onChange={e => setForm({ ...form, mes_referencia: e.target.value })} />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Valor (R$) *</Form.Label>
                  <Form.Control required type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Vencimento *</Form.Label>
                  <Form.Control required type="date" value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} />
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

      <Modal show={showPagModal} onHide={() => setShowPagModal(false)}>
        <Form onSubmit={registrarPagamento}>
          <Modal.Header closeButton><Modal.Title>Registrar Pagamento</Modal.Title></Modal.Header>
          <Modal.Body>
            <p className="text-muted mb-3">Mensalidade: <strong>{mensalidadeSelecionada?.mes_referencia}</strong> — {mensalidadeSelecionada?.aluno.nome}</p>
            <Form.Group className="mb-3">
              <Form.Label>Valor Pago (R$) *</Form.Label>
              <Form.Control required type="number" step="0.01" value={pagForm.valor_pago} onChange={e => setPagForm({ ...pagForm, valor_pago: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Forma de Pagamento *</Form.Label>
              <Form.Select value={pagForm.forma_pagamento} onChange={e => setPagForm({ ...pagForm, forma_pagamento: e.target.value })}>
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

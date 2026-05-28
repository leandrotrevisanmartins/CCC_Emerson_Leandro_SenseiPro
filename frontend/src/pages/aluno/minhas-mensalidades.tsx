import { useEffect, useState } from "react";
import { Table, Badge, Spinner, Alert, Button, Modal, Form, Row, Col } from "react-bootstrap";
import api from "../services/api";

const statusVariant: Record<string, string> = {
  pendente: "warning",
  pago: "success",
  atrasado: "danger",
};

export default function MinhasMensalidades() {
  const [mensalidades, setMensalidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Modal de pagamento
  const [showModal, setShowModal] = useState(false);
  const [mensalidadeSelecionada, setMensalidadeSelecionada] = useState<any>(null);
  const [pagForm, setPagForm] = useState({ valor_pago: "", forma_pagamento: "PIX" });
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      const r = await api.get("/me/mensalidades");
      setMensalidades(Array.isArray(r.data) ? r.data : []);
    } catch {
      setErro("Erro ao carregar mensalidades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirPagamento = (m: any) => {
    setMensalidadeSelecionada(m);
    setPagForm({ valor_pago: String(m.valor), forma_pagamento: "PIX" });
    setSucesso("");
    setShowModal(true);
  };

  const confirmarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/me/pagamentos", {
        id_mensalidade: mensalidadeSelecionada.id_mensalidade,
        valor_pago: parseFloat(pagForm.valor_pago),
        forma_pagamento: pagForm.forma_pagamento,
      });
      setShowModal(false);
      setSucesso(`Pagamento de "${mensalidadeSelecionada.mes_referencia}" confirmado com sucesso!`);
      carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.error || "Erro ao registrar pagamento.");
    } finally {
      setSalvando(false);
    }
  };

  const pendentes = mensalidades.filter(m => m.status !== "pago");
  const totalPendente = pendentes.reduce((acc, m) => acc + Number(m.valor), 0);

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">💰 Financeiro</h4>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
      {sucesso && <Alert variant="success" dismissible onClose={() => setSucesso("")}>{sucesso}</Alert>}

      {/* Cards de resumo */}
      {!loading && mensalidades.length > 0 && (
        <Row className="g-3 mb-4">
          <Col xs={12} sm={4}>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 500 }}>{mensalidades.length}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>total de mensalidades</div>
            </div>
          </Col>
          <Col xs={12} sm={4}>
            <div style={{ background: pendentes.length > 0 ? "var(--color-background-danger)" : "var(--color-background-success)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 500, color: pendentes.length > 0 ? "var(--color-text-danger)" : "var(--color-text-success)" }}>
                {pendentes.length}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>pendente(s)</div>
            </div>
          </Col>
          <Col xs={12} sm={4}>
            <div style={{ background: totalPendente > 0 ? "var(--color-background-warning)" : "var(--color-background-success)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 500, color: totalPendente > 0 ? "var(--color-text-warning)" : "var(--color-text-success)" }}>
                R$ {totalPendente.toFixed(2)}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>valor em aberto</div>
            </div>
          </Col>
        </Row>
      )}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : mensalidades.length === 0 ? (
        <p className="text-muted">Nenhuma mensalidade registrada.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Mês</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {mensalidades.map((m: any) => (
              <tr key={m.id_mensalidade}>
                <td>{m.mes_referencia}</td>
                <td>R$ {Number(m.valor).toFixed(2)}</td>
                <td>{new Date(m.data_vencimento).toLocaleDateString("pt-BR")}</td>
                <td>
                  <Badge bg={statusVariant[m.status]}>{m.status}</Badge>
                </td>
                <td>
                  {m.status !== "pago" ? (
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => abrirPagamento(m)}
                    >
                      💳 Pagar
                    </Button>
                  ) : (
                    <span className="text-muted" style={{ fontSize: "12px" }}>✓ Pago</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal confirmar pagamento */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={confirmarPagamento}>
          <Modal.Header closeButton>
            <Modal.Title>💳 Confirmar Pagamento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3 p-3" style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Mensalidade</div>
              <div style={{ fontWeight: 500 }}>{mensalidadeSelecionada?.mes_referencia}</div>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: 4 }}>
                Vencimento: {mensalidadeSelecionada?.data_vencimento
                  ? new Date(mensalidadeSelecionada.data_vencimento).toLocaleDateString("pt-BR")
                  : "—"}
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Valor Pago (R$) *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                required
                value={pagForm.valor_pago}
                onChange={e => setPagForm({ ...pagForm, valor_pago: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Forma de Pagamento *</Form.Label>
              <Form.Select
                value={pagForm.forma_pagamento}
                onChange={e => setPagForm({ ...pagForm, forma_pagamento: e.target.value })}
              >
                <option>PIX</option>
                <option>Dinheiro</option>
                <option>Cartão de Débito</option>
                <option>Cartão de Crédito</option>
                <option>Transferência</option>
              </Form.Select>
            </Form.Group>

            <Alert variant="info" style={{ fontSize: "12px" }}>
              Ao confirmar, o status da mensalidade será atualizado para <strong>pago</strong>.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="success" type="submit" disabled={salvando}>
              {salvando ? "Confirmando..." : "Confirmar Pagamento"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

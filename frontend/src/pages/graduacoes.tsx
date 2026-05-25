import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { GraduacaoInterface, AlunoInterface } from "./interfaces";
import { graduacaoService, alunoService } from "./services";

export default function Graduacoes() {
  const [graduacoes, setGraduacoes] = useState<GraduacaoInterface[]>([]);
  const [alunos, setAlunos] = useState<AlunoInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(0);
  const [form, setForm] = useState({ faixa: "", data_graduacao: "", observacao: "" });
  const [salvando, setSalvando] = useState(false);

  const faixas = ["Branca", "Branca - 1 Grau", "Branca - 2 Grau", "Branca - 3 Grau", "Cinza", "Azul", "Azul - 1 Grau", "Roxo", "Marrom", "Preta"];

  useEffect(() => {
    alunoService.getAll().then(setAlunos).catch(() => setErro("Erro ao carregar alunos."));
  }, []);

  const buscarGraduacoes = async (id: number) => {
    if (!id) { setGraduacoes([]); return; }
    setLoading(true);
    try { setGraduacoes(await graduacaoService.getByAluno(id)); }
    catch { setErro("Erro ao buscar graduações."); }
    finally { setLoading(false); }
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await graduacaoService.create({ ...form, id_aluno: alunoSelecionado });
      setShowModal(false);
      buscarGraduacoes(alunoSelecionado);
    } catch {
      setErro("Erro ao registrar graduação.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (id: number) => {
    if (!confirm("Remover este registro?")) return;
    try { await graduacaoService.delete(id); buscarGraduacoes(alunoSelecionado); }
    catch { setErro("Erro ao remover graduação."); }
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="fw-bold mb-0">🥇 Graduações</h4></Col>
        <Col xs="auto">
          <Button variant="dark" size="sm" disabled={!alunoSelecionado}
            onClick={() => { setForm({ faixa: "", data_graduacao: new Date().toISOString().slice(0, 10), observacao: "" }); setShowModal(true); }}>
            + Nova Graduação
          </Button>
        </Col>
      </Row>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}

      <Row className="mb-3">
        <Col sm={5}>
          <Form.Select value={alunoSelecionado} onChange={e => { const id = Number(e.target.value); setAlunoSelecionado(id); buscarGraduacoes(id); }}>
            <option value={0}>Selecione um aluno...</option>
            {alunos.map(a => <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>)}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : alunoSelecionado === 0 ? (
        <p className="text-muted">Selecione um aluno para ver seu histórico de graduações.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Faixa</th><th>Data</th><th>Observação</th><th>Ação</th></tr>
          </thead>
          <tbody>
            {graduacoes.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted">Nenhuma graduação registrada.</td></tr>
            ) : graduacoes.map(g => (
              <tr key={g.id_graduacao}>
                <td>{g.id_graduacao}</td>
                <td><strong>{g.faixa}</strong></td>
                <td>{new Date(g.data_graduacao).toLocaleDateString("pt-BR")}</td>
                <td>{g.observacao || "—"}</td>
                <td><Button size="sm" variant="outline-danger" onClick={() => deletar(g.id_graduacao!)}>Remover</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton><Modal.Title>Nova Graduação</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Faixa *</Form.Label>
              <Form.Select required value={form.faixa} onChange={e => setForm({ ...form, faixa: e.target.value })}>
                <option value="">Selecione...</option>
                {faixas.map(f => <option key={f}>{f}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data *</Form.Label>
              <Form.Control type="date" required value={form.data_graduacao} onChange={e => setForm({ ...form, data_graduacao: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Observação</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="dark" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

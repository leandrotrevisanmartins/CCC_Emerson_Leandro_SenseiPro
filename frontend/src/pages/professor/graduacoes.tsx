import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import api from "../services/api";

export default function ProfessorGraduacoes() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(0);
  const [graduacoes, setGraduacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrad, setLoadingGrad] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    faixa: "",
    data_graduacao: new Date().toISOString().slice(0, 10),
    observacao: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const faixas = [
    "Branca", "Branca - 1 Grau", "Branca - 2 Grau", "Branca - 3 Grau",
    "Cinza", "Azul", "Azul - 1 Grau", "Roxo", "Marrom", "Preta",
  ];

  useEffect(() => {
    api.get("/me/turmas")
      .then(r => {
        const lista = Array.isArray(r.data) ? r.data : [];
        setTurmas(lista);
        const todos = lista
          .flatMap((t: any) => t.alunos || [])
          .filter((a: any, i: number, arr: any[]) =>
            arr.findIndex(x => x.id_aluno === a.id_aluno) === i
          );
        setAlunos(todos);
      })
      .catch(() => setErro("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, []);

  const buscarGraduacoes = async (id: number) => {
    if (!id) { setGraduacoes([]); return; }
    setLoadingGrad(true);
    api.get(`/graduacoes/aluno/${id}`)
      .then(r => setGraduacoes(Array.isArray(r.data) ? r.data : []))
      .catch(() => setErro("Erro ao buscar graduações."))
      .finally(() => setLoadingGrad(false));
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/graduacoes", { ...form, id_aluno: alunoSelecionado });
      setShowModal(false);
      setSucesso("Graduação registrada com sucesso.");
      buscarGraduacoes(alunoSelecionado);
    } catch {
      setErro("Erro ao registrar graduação.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">🥇 Graduações</h4>
      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
      {sucesso && <Alert variant="success" dismissible onClose={() => setSucesso("")}>{sucesso}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Row className="mb-3 align-items-center g-2">
            <Col sm={5}>
              <Form.Select
                value={alunoSelecionado}
                onChange={e => {
                  const id = Number(e.target.value);
                  setAlunoSelecionado(id);
                  buscarGraduacoes(id);
                }}
              >
                <option value={0}>Selecione um aluno...</option>
                {alunos.map((a: any) => (
                  <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs="auto">
              <Button
                variant="dark"
                size="sm"
                disabled={!alunoSelecionado}
                onClick={() => {
                  setForm({ faixa: "", data_graduacao: new Date().toISOString().slice(0, 10), observacao: "" });
                  setShowModal(true);
                }}
              >
                + Nova Graduação
              </Button>
            </Col>
          </Row>

          {alunoSelecionado === 0 ? (
            <p className="text-muted">Selecione um aluno para ver o histórico.</p>
          ) : loadingGrad ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr><th>Faixa</th><th>Data</th><th>Observação</th></tr>
              </thead>
              <tbody>
                {graduacoes.length === 0 ? (
                  <tr><td colSpan={3} className="text-center text-muted">Sem graduações registradas.</td></tr>
                ) : graduacoes.map((g: any) => (
                  <tr key={g.id_graduacao}>
                    <td><strong>{g.faixa}</strong></td>
                    <td>{new Date(g.data_graduacao).toLocaleDateString("pt-BR")}</td>
                    <td>{g.observacao || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
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
              <Form.Control type="date" required value={form.data_graduacao}
                onChange={e => setForm({ ...form, data_graduacao: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Observação</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.observacao}
                onChange={e => setForm({ ...form, observacao: e.target.value })} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="dark" type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

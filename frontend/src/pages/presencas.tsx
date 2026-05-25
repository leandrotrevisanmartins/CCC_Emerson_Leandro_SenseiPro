import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col } from "react-bootstrap";
import { PresencaInterface, AlunoInterface, TurmaInterface } from "./interfaces";
import { presencaService, alunoService, turmaService } from "./services";

export default function Presencas() {
  const [presencas, setPresencas] = useState<PresencaInterface[]>([]);
  const [alunos, setAlunos] = useState<AlunoInterface[]>([]);
  const [turmas, setTurmas] = useState<TurmaInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id_aluno: 0, id_turma: 0, data: "", presente: true });
  const [salvando, setSalvando] = useState(false);
  const [filtroAluno, setFiltroAluno] = useState(0);
  const [filtroTurma, setFiltroTurma] = useState(0);

  const carregar = async () => {
    try {
      setLoading(true);
      const [pr, al, tu] = await Promise.all([
        presencaService.getAll(),
        alunoService.getAll(),
        turmaService.getAll(),
      ]);
      setPresencas(pr);
      setAlunos(al);
      setTurmas(tu);
    } catch {
      setErro("Erro ao carregar presenças.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setForm({ id_aluno: 0, id_turma: 0, data: new Date().toISOString().slice(0, 10), presente: true });
    setShowModal(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_aluno || !form.id_turma) { setErro("Selecione aluno e turma."); return; }
    setSalvando(true);
    try {
      await presencaService.create(form);
      setShowModal(false);
      carregar();
    } catch {
      setErro("Erro ao registrar presença.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (id: number) => {
    if (!confirm("Remover este registro?")) return;
    try { await presencaService.delete(id); carregar(); }
    catch { setErro("Erro ao remover presença."); }
  };

  const filtradas = presencas.filter(p => {
    if (filtroAluno && p.aluno.id_aluno !== filtroAluno) return false;
    if (filtroTurma && p.turma.id_turma !== filtroTurma) return false;
    return true;
  });

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="fw-bold mb-0">✅ Presenças</h4></Col>
        <Col xs="auto">
          <Button variant="dark" size="sm" onClick={abrirNovo}>+ Registrar Presença</Button>
        </Col>
      </Row>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}

      <Row className="mb-3 g-2">
        <Col sm={4}>
          <Form.Select value={filtroAluno} onChange={e => setFiltroAluno(Number(e.target.value))}>
            <option value={0}>Todos os alunos</option>
            {alunos.map(a => <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>)}
          </Form.Select>
        </Col>
        <Col sm={4}>
          <Form.Select value={filtroTurma} onChange={e => setFiltroTurma(Number(e.target.value))}>
            <option value={0}>Todas as turmas</option>
            {turmas.map(t => <option key={t.id_turma} value={t.id_turma}>{t.nome}</option>)}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Aluno</th><th>Turma</th><th>Data</th><th>Presente</th><th>Ação</th></tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted">Nenhum registro encontrado.</td></tr>
            ) : filtradas.map(p => (
              <tr key={p.id_presenca}>
                <td>{p.id_presenca}</td>
                <td>{p.aluno.nome}</td>
                <td>{p.turma.nome}</td>
                <td>{new Date(p.data).toLocaleDateString("pt-BR")}</td>
                <td><Badge bg={p.presente ? "success" : "danger"}>{p.presente ? "Sim" : "Não"}</Badge></td>
                <td><Button size="sm" variant="outline-danger" onClick={() => deletar(p.id_presenca!)}>Remover</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton><Modal.Title>Registrar Presença</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Aluno *</Form.Label>
              <Form.Select required value={form.id_aluno} onChange={e => setForm({ ...form, id_aluno: Number(e.target.value) })}>
                <option value={0}>Selecione...</option>
                {alunos.map(a => <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Turma *</Form.Label>
              <Form.Select required value={form.id_turma} onChange={e => setForm({ ...form, id_turma: Number(e.target.value) })}>
                <option value={0}>Selecione...</option>
                {turmas.map(t => <option key={t.id_turma} value={t.id_turma}>{t.nome}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Data *</Form.Label>
              <Form.Control type="date" required value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
            </Form.Group>
            <Form.Check type="switch" label="Presente" checked={form.presente} onChange={e => setForm({ ...form, presente: e.target.checked })} />
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

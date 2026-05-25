import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col } from "react-bootstrap";
import { TurmaInterface, ModalidadeInterface, ProfessorInterface } from "./interfaces";
import { turmaService, modalidadeService, professorService } from "./services";

export default function Turmas() {
  const [turmas, setTurmas] = useState<TurmaInterface[]>([]);
  const [modalidades, setModalidades] = useState<ModalidadeInterface[]>([]);
  const [professores, setProfessores] = useState<ProfessorInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<TurmaInterface | null>(null);
  const [form, setForm] = useState({ nome: "", horario: "", dia_semana: "", id_modalidade: 0, id_professor: 0 });
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      const [t, m, p] = await Promise.all([
        turmaService.getAll(),
        modalidadeService.getAll(),
        professorService.getAll(),
      ]);
      setTurmas(t);
      setModalidades(m);
      setProfessores(p);
      if (m.length === 0) setAviso("Nenhuma modalidade cadastrada. Cadastre uma modalidade antes de criar turmas.");
      else if (p.length === 0) setAviso("Nenhum professor cadastrado. Cadastre um professor antes de criar turmas.");
      else setAviso("");
    } catch {
      setErro("Erro ao carregar turmas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    if (modalidades.length === 0 || professores.length === 0) {
      setErro("Cadastre ao menos uma modalidade e um professor antes de criar turmas.");
      return;
    }
    setEditando(null);
    setForm({ nome: "", horario: "", dia_semana: "", id_modalidade: 0, id_professor: 0 });
    setShowModal(true);
  };

  const abrirEdicao = (t: TurmaInterface) => {
    setEditando(t);
    setForm({
      nome: t.nome, horario: t.horario, dia_semana: t.dia_semana,
      id_modalidade: t.modalidade.id_modalidade || 0,
      id_professor: t.professor.id_professor || 0,
    });
    setShowModal(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_modalidade || !form.id_professor) {
      setErro("Selecione modalidade e professor.");
      return;
    }
    setSalvando(true);
    try {
      editando?.id_turma
        ? await turmaService.update(editando.id_turma, form)
        : await turmaService.create(form);
      setShowModal(false);
      carregar();
    } catch {
      setErro("Erro ao salvar turma.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (id: number) => {
    if (!confirm("Deseja excluir esta turma?")) return;
    try { await turmaService.delete(id); carregar(); }
    catch { setErro("Erro ao excluir turma."); }
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="fw-bold mb-0">📅 Turmas</h4></Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" href="/modalidades">Gerenciar Modalidades</Button>
          <Button variant="dark" size="sm" onClick={abrirNovo}>+ Nova Turma</Button>
        </Col>
      </Row>

      {aviso && <Alert variant="warning">{aviso}</Alert>}
      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Nome</th><th>Horário</th><th>Dias</th><th>Modalidade</th><th>Professor</th><th>Alunos</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {turmas.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-muted">Nenhuma turma cadastrada.</td></tr>
            ) : turmas.map(t => (
              <tr key={t.id_turma}>
                <td>{t.id_turma}</td>
                <td>{t.nome}</td>
                <td>{t.horario}</td>
                <td>{t.dia_semana}</td>
                <td><Badge bg="info" text="dark">{t.modalidade.nome}</Badge></td>
                <td>{t.professor.nome}</td>
                <td>{t.alunos?.length ?? 0}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(t)}>Editar</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => deletar(t.id_turma!)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title>{editando ? "Editar Turma" : "Nova Turma"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome *</Form.Label>
              <Form.Control required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Horário *</Form.Label>
                  <Form.Control required value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} placeholder="19:00" />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Dias *</Form.Label>
                  <Form.Control required value={form.dia_semana} onChange={e => setForm({ ...form, dia_semana: e.target.value })} placeholder="Seg/Qua" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Modalidade *</Form.Label>
              <Form.Select required value={form.id_modalidade} onChange={e => setForm({ ...form, id_modalidade: Number(e.target.value) })}>
                <option value={0}>Selecione...</option>
                {modalidades.map(m => <option key={m.id_modalidade} value={m.id_modalidade}>{m.nome}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Professor *</Form.Label>
              <Form.Select required value={form.id_professor} onChange={e => setForm({ ...form, id_professor: Number(e.target.value) })}>
                <option value={0}>Selecione...</option>
                {professores.map(p => <option key={p.id_professor} value={p.id_professor}>{p.nome}</option>)}
              </Form.Select>
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

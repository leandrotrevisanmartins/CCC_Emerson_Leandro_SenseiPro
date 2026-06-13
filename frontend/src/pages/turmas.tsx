import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col, ListGroup } from "react-bootstrap";
import { TurmaInterface, ModalidadeInterface, ProfessorInterface, AlunoInterface } from "./interfaces";
import { turmaService, modalidadeService, professorService, alunoService } from "./services";

export default function Turmas() {
  const [turmas, setTurmas] = useState<TurmaInterface[]>([]);
  const [modalidades, setModalidades] = useState<ModalidadeInterface[]>([]);
  const [professores, setProfessores] = useState<ProfessorInterface[]>([]);
  const [todosAlunos, setTodosAlunos] = useState<AlunoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  // Modal de criar/editar turma
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<TurmaInterface | null>(null);
  const [form, setForm] = useState({ nome: "", horario: "", dia_semana: "", id_modalidade: 0, id_professor: 0 });
  const [salvando, setSalvando] = useState(false);

  // Modal de matrícula
  const [showMatriculaModal, setShowMatriculaModal] = useState(false);
  const [turmaMatricula, setTurmaMatricula] = useState<TurmaInterface | null>(null);
  const [alunosMatriculados, setAlunosMatriculados] = useState<AlunoInterface[]>([]);
  const [alunoParaMatricular, setAlunoParaMatricular] = useState(0);
  const [salvandoMatricula, setSalvandoMatricula] = useState(false);
  const [erroMatricula, setErroMatricula] = useState("");

  const carregar = async () => {
    try {
      setLoading(true);
      const [t, m, p, a] = await Promise.all([
        turmaService.getAll(),
        modalidadeService.getAll(),
        professorService.getAll(),
        alunoService.getAll(),
      ]);
      setTurmas(t);
      setModalidades(m);
      setProfessores(p);
      setTodosAlunos(a);
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

  // ── Criar / Editar turma ──────────────────────────────────────
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
    catch (err: any) { const msg = err?.response?.data?.error || "Erro ao excluir turma."; const sug = err?.response?.data?.sugestao || ""; setErro(sug ? `${msg} ${sug}` : msg); }
  };

  // ── Matrícula ─────────────────────────────────────────────────
  const abrirMatricula = async (t: TurmaInterface) => {
    setErroMatricula("");
    setAlunoParaMatricular(0);
    setTurmaMatricula(t);
    // Busca turma atualizada com lista de alunos
    try {
      const turmaAtualizada = await turmaService.getById(t.id_turma!);
      setAlunosMatriculados(turmaAtualizada.alunos || []);
    } catch {
      setAlunosMatriculados(t.alunos || []);
    }
    setShowMatriculaModal(true);
  };

  const matricular = async () => {
    if (!alunoParaMatricular || !turmaMatricula?.id_turma) return;
    setSalvandoMatricula(true);
    setErroMatricula("");
    try {
      await turmaService.matricular(turmaMatricula.id_turma, alunoParaMatricular);
      const turmaAtualizada = await turmaService.getById(turmaMatricula.id_turma);
      setAlunosMatriculados(turmaAtualizada.alunos || []);
      setAlunoParaMatricular(0);
      carregar();
    } catch {
      setErroMatricula("Erro ao matricular. O aluno pode já estar nesta turma.");
    } finally {
      setSalvandoMatricula(false);
    }
  };

  const desmatricular = async (id_aluno: number) => {
    if (!turmaMatricula?.id_turma) return;
    if (!confirm("Remover este aluno da turma?")) return;
    setSalvandoMatricula(true);
    setErroMatricula("");
    try {
      await turmaService.desmatricular(turmaMatricula.id_turma, id_aluno);
      const turmaAtualizada = await turmaService.getById(turmaMatricula.id_turma);
      setAlunosMatriculados(turmaAtualizada.alunos || []);
      carregar();
    } catch {
      setErroMatricula("Erro ao desmatricular aluno.");
    } finally {
      setSalvandoMatricula(false);
    }
  };

  // Alunos disponíveis = todos - já matriculados
  const alunosDisponiveis = todosAlunos.filter(
    a => !alunosMatriculados.some(m => m.id_aluno === a.id_aluno) && a.status === "ativo"
  );

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
            <tr>
              <th>#</th><th>Nome</th><th>Horário</th><th>Dias</th>
              <th>Modalidade</th><th>Professor</th><th>Alunos</th><th>Ações</th>
            </tr>
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
                <td>
                  <Badge bg="secondary" style={{ cursor: "pointer" }} onClick={() => abrirMatricula(t)}>
                    {t.alunos?.length ?? 0} aluno(s)
                  </Badge>
                </td>
                <td>
                  <Button size="sm" variant="outline-success" className="me-1" onClick={() => abrirMatricula(t)}>
                    Matrículas
                  </Button>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(t)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => deletar(t.id_turma!)}>
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* ── Modal criar/editar turma ── */}
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

      {/* ── Modal de matrículas ── */}
      <Modal show={showMatriculaModal} onHide={() => setShowMatriculaModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Matrículas — {turmaMatricula?.nome}
            <span className="text-muted fw-normal" style={{ fontSize: "0.85rem", marginLeft: 8 }}>
              {turmaMatricula?.modalidade.nome} · {turmaMatricula?.horario} · {turmaMatricula?.dia_semana}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erroMatricula && <Alert variant="danger" dismissible onClose={() => setErroMatricula("")}>{erroMatricula}</Alert>}

          {/* Adicionar aluno */}
          <p className="section-label fw-bold mb-2" style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
            ADICIONAR ALUNO
          </p>
          <Row className="mb-4 g-2">
            <Col>
              <Form.Select
                value={alunoParaMatricular}
                onChange={e => setAlunoParaMatricular(Number(e.target.value))}
                disabled={salvandoMatricula}
              >
                <option value={0}>
                  {alunosDisponiveis.length === 0
                    ? "Nenhum aluno ativo disponível"
                    : "Selecione um aluno para matricular..."}
                </option>
                {alunosDisponiveis.map(a => (
                  <option key={a.id_aluno} value={a.id_aluno}>{a.nome}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs="auto">
              <Button
                variant="success"
                disabled={!alunoParaMatricular || salvandoMatricula}
                onClick={matricular}
              >
                {salvandoMatricula ? <Spinner size="sm" animation="border" /> : "Matricular"}
              </Button>
            </Col>
          </Row>

          {/* Lista de matriculados */}
          <p className="fw-bold mb-2" style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
            ALUNOS MATRICULADOS ({alunosMatriculados.length})
          </p>
          {alunosMatriculados.length === 0 ? (
            <p className="text-muted text-center py-3" style={{ fontSize: "13px" }}>
              Nenhum aluno matriculado nesta turma.
            </p>
          ) : (
            <ListGroup>
              {alunosMatriculados.map(a => (
                <ListGroup.Item
                  key={a.id_aluno}
                  className="d-flex align-items-center justify-content-between py-2"
                >
                  <div>
                    <span style={{ fontWeight: 500 }}>{a.nome}</span>
                    {a.email && (
                      <span className="text-muted ms-2" style={{ fontSize: "12px" }}>{a.email}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    disabled={salvandoMatricula}
                    onClick={() => desmatricular(a.id_aluno!)}
                  >
                    Remover
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMatriculaModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

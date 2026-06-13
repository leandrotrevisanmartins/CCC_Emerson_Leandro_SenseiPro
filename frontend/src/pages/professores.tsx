import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { ProfessorInterface } from "./interfaces";
import { professorService } from "./services";

export default function Professores() {
  const [professores, setProfessores] = useState<ProfessorInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<ProfessorInterface | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", especialidade: "" });
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      setProfessores(await professorService.getAll());
    } catch {
      setErro("Erro ao carregar professores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: "", email: "", telefone: "", especialidade: "" });
    setShowModal(true);
  };

  const abrirEdicao = (p: ProfessorInterface) => {
    setEditando(p);
    setForm({ nome: p.nome, email: p.email || "", telefone: p.telefone || "", especialidade: p.especialidade || "" });
    setShowModal(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      editando?.id_professor
        ? await professorService.update(editando.id_professor, form)
        : await professorService.create(form);
      setShowModal(false);
      carregar();
    } catch {
      setErro("Erro ao salvar professor.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (id: number) => {
    if (!confirm("Deseja excluir este professor?")) return;
    try { await professorService.delete(id); carregar(); }
    catch (err: any) { const msg = err?.response?.data?.error || "Erro ao excluir professor."; const sug = err?.response?.data?.sugestao || ""; setErro(sug ? `${msg} ${sug}` : msg); }
  };

  const filtrados = professores.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.especialidade?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="fw-bold mb-0">👨‍🏫 Professores</h4></Col>
        <Col xs="auto">
          <Button variant="dark" size="sm" onClick={abrirNovo}>+ Novo Professor</Button>
        </Col>
      </Row>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}

      <Form.Control
        type="text" placeholder="Buscar por nome ou especialidade..."
        className="mb-3" value={busca} onChange={e => setBusca(e.target.value)}
      />

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Nome</th><th>Email</th><th>Telefone</th><th>Especialidade</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted">Nenhum professor encontrado.</td></tr>
            ) : filtrados.map(p => (
              <tr key={p.id_professor}>
                <td>{p.id_professor}</td>
                <td>{p.nome}</td>
                <td>{p.email || "—"}</td>
                <td>{p.telefone || "—"}</td>
                <td>{p.especialidade || "—"}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(p)}>Editar</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => deletar(p.id_professor!)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title>{editando ? "Editar Professor" : "Novo Professor"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome *</Form.Label>
              <Form.Control required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Especialidade</Form.Label>
              <Form.Control value={form.especialidade} onChange={e => setForm({ ...form, especialidade: e.target.value })} />
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

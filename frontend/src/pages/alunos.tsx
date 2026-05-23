import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Badge, Spinner, Row, Col } from "react-bootstrap";
import { AlunoInterface } from "./interfaces";
import { alunoService } from "./services";
export default function Alunos() {
  const [alunos, setAlunos] = useState<AlunoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<AlunoInterface | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", data_nascimento: "" });
  const [salvando, setSalvando] = useState(false);
  const carregar = async () => {
    try { setLoading(true); setAlunos(await alunoService.getAll()); }
    catch { setErro("Erro ao carregar alunos."); }
    finally { setLoading(false); }
  };
  useEffect(() => { carregar(); }, []);
  const abrirNovo = () => { setEditando(null); setForm({ nome: "", email: "", telefone: "", data_nascimento: "" }); setShowModal(true); };
  const abrirEdicao = (a: AlunoInterface) => {
    setEditando(a);
    setForm({ nome: a.nome, email: a.email || "", telefone: a.telefone || "", data_nascimento: a.data_nascimento?.slice(0, 10) || "" });
    setShowModal(true);
  };
  const salvar = async (e: React.FormEvent) => {
    e.preventDefault(); setSalvando(true);
    try {
      editando?.id_aluno ? await alunoService.update(editando.id_aluno, form) : await alunoService.create(form);
      setShowModal(false); carregar();
    } catch { setErro("Erro ao salvar aluno."); }
    finally { setSalvando(false); }
  };
  const deletar = async (id: number) => {
    if (!confirm("Deseja excluir este aluno?")) return;
    try { await alunoService.delete(id); carregar(); }
    catch { setErro("Erro ao excluir aluno."); }
  };
  const filtrados = alunos.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.email?.toLowerCase().includes(busca.toLowerCase()) ||
    a.telefone?.includes(busca)
  );
  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="fw-bold mb-0">🥋 Alunos</h4></Col>
        <Col xs="auto"><Button variant="dark" size="sm" onClick={abrirNovo}>+ Novo Aluno</Button></Col>
      </Row>
      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
      <Form.Control type="text" placeholder="Buscar por nome, email ou telefone..." className="mb-3" value={busca} onChange={e => setBusca(e.target.value)} />
      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Nome</th><th>Email</th><th>Telefone</th><th>Status</th><th>Cadastro</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? <tr><td colSpan={7} className="text-center text-muted">Nenhum aluno encontrado.</td></tr> :
              filtrados.map(a => (
                <tr key={a.id_aluno}>
                  <td>{a.id_aluno}</td><td>{a.nome}</td><td>{a.email || "—"}</td><td>{a.telefone || "—"}</td>
                  <td><Badge bg={a.status === "ativo" ? "success" : "secondary"}>{a.status}</Badge></td>
                  <td>{a.data_cadastro ? new Date(a.data_cadastro).toLocaleDateString("pt-BR") : "—"}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(a)}>Editar</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => deletar(a.id_aluno!)}>Excluir</Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton><Modal.Title>{editando ? "Editar Aluno" : "Novo Aluno"}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Nome *</Form.Label><Form.Control required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Telefone</Form.Label><Form.Control value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Data de Nascimento</Form.Label><Form.Control type="date" value={form.data_nascimento} onChange={e => setForm({ ...form, data_nascimento: e.target.value })} /></Form.Group>
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

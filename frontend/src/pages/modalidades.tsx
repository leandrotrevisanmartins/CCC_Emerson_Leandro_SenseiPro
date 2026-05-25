import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { ModalidadeInterface } from "./interfaces";
import { modalidadeService } from "./services";

export default function Modalidades() {
  const [modalidades, setModalidades] = useState<ModalidadeInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<ModalidadeInterface | null>(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      setModalidades(await modalidadeService.getAll());
    } catch {
      setErro("Erro ao carregar modalidades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: "", descricao: "" });
    setShowModal(true);
  };

  const abrirEdicao = (m: ModalidadeInterface) => {
    setEditando(m);
    setForm({ nome: m.nome, descricao: m.descricao || "" });
    setShowModal(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      editando?.id_modalidade
        ? await modalidadeService.update(editando.id_modalidade, form)
        : await modalidadeService.create(form);
      setShowModal(false);
      carregar();
    } catch {
      setErro("Erro ao salvar modalidade.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (id: number) => {
    if (!confirm("Deseja excluir esta modalidade?")) return;
    try { await modalidadeService.delete(id); carregar(); }
    catch { setErro("Erro ao excluir modalidade."); }
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="fw-bold mb-0">🎽 Modalidades</h4></Col>
        <Col xs="auto">
          <Button variant="dark" size="sm" onClick={abrirNovo}>+ Nova Modalidade</Button>
        </Col>
      </Row>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Nome</th><th>Descrição</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {modalidades.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-muted">Nenhuma modalidade cadastrada.</td></tr>
            ) : modalidades.map(m => (
              <tr key={m.id_modalidade}>
                <td>{m.id_modalidade}</td>
                <td>{m.nome}</td>
                <td>{m.descricao || "—"}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(m)}>Editar</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => deletar(m.id_modalidade!)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title>{editando ? "Editar Modalidade" : "Nova Modalidade"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome *</Form.Label>
              <Form.Control required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Jiu-Jitsu, Judô" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
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

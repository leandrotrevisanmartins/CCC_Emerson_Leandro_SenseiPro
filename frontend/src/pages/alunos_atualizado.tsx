import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Badge, Spinner, Row, Col } from "react-bootstrap";
import { AlunoInterface } from "./interfaces";
import { alunoService } from "./services";

export default function Alunos() {
  const [alunos, setAlunos] = useState<AlunoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<AlunoInterface | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", data_nascimento: "" });
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      setAlunos(await alunoService.getAll());
    } catch {
      setErro("Erro ao carregar alunos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ nome: "", email: "", telefone: "", data_nascimento: "" });
    setShowModal(true);
  };

  const abrirEdicao = (a: AlunoInterface) => {
    setEditando(a);
    setForm({
      nome: a.nome,
      email: a.email || "",
      telefone: a.telefone || "",
      data_nascimento: a.data_nascimento?.slice(0, 10) || "",
    });
    setShowModal(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editando?.id_aluno) {
        await alunoService.update(editando.id_aluno, form);
        setSucesso("Aluno atualizado com sucesso.");
      } else {
        await alunoService.create(form);
        setSucesso("Aluno cadastrado com sucesso.");
      }
      setShowModal(false);
      carregar();
    } catch {
      setErro("Erro ao salvar aluno.");
    } finally {
      setSalvando(false);
    }
  };

  const inativar = async (aluno: AlunoInterface) => {
    if (!confirm(`Deseja inativar o aluno "${aluno.nome}"? O histórico será mantido.`)) return;
    try {
      await alunoService.inativar(aluno.id_aluno!);
      setSucesso(`Aluno "${aluno.nome}" inativado com sucesso.`);
      carregar();
    } catch {
      setErro("Erro ao inativar aluno.");
    }
  };

  const deletar = async (aluno: AlunoInterface) => {
    if (!confirm(`Deseja excluir permanentemente o aluno "${aluno.nome}"?`)) return;
    try {
      await alunoService.delete(aluno.id_aluno!);
      setSucesso(`Aluno "${aluno.nome}" excluído com sucesso.`);
      carregar();
    } catch (err: any) {
      // Trata o bloqueio do backend (409 Conflict)
      const msg = err?.response?.data?.error;
      const sugestao = err?.response?.data?.sugestao;
      const detalhes = err?.response?.data?.detalhes;

      if (err?.response?.status === 409) {
        const detalheTexto = detalhes
          ? ` (${detalhes.presencas} presença(s), ${detalhes.mensalidades} mensalidade(s))`
          : "";
        setErro(
          `${msg}${detalheTexto}. ${sugestao || "Use o botão Inativar para manter o histórico."}`
        );
      } else {
        setErro("Erro ao excluir aluno.");
      }
    }
  };

  const reativar = async (aluno: AlunoInterface) => {
    if (!confirm(`Deseja reativar o aluno "${aluno.nome}"?`)) return;
    try {
      await alunoService.update(aluno.id_aluno!, { status: "ativo" });
      setSucesso(`Aluno "${aluno.nome}" reativado com sucesso.`);
      carregar();
    } catch {
      setErro("Erro ao reativar aluno.");
    }
  };

  const filtrados = alunos.filter(a => {
    const textoOk =
      a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.email?.toLowerCase().includes(busca.toLowerCase()) ||
      a.telefone?.includes(busca);
    const statusOk = filtroStatus ? a.status === filtroStatus : true;
    return textoOk && statusOk;
  });

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col><h4 className="fw-bold mb-0">🥋 Alunos</h4></Col>
        <Col xs="auto">
          <Button variant="dark" size="sm" onClick={abrirNovo}>+ Novo Aluno</Button>
        </Col>
      </Row>

      {erro && (
        <Alert variant="danger" dismissible onClose={() => setErro("")}>
          {erro}
        </Alert>
      )}
      {sucesso && (
        <Alert variant="success" dismissible onClose={() => setSucesso("")}>
          {sucesso}
        </Alert>
      )}

      <Row className="mb-3 g-2">
        <Col sm={5}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </Col>
        <Col sm={3}>
          <Form.Select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Form.Select>
        </Col>
        {(busca || filtroStatus) && (
          <Col xs="auto">
            <Button variant="outline-secondary" size="sm" onClick={() => { setBusca(""); setFiltroStatus(""); }}>
              Limpar filtros
            </Button>
          </Col>
        )}
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th><th>Nome</th><th>Email</th><th>Telefone</th>
              <th>Status</th><th>Cadastro</th><th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted py-4">Nenhum aluno encontrado.</td></tr>
            ) : filtrados.map(a => (
              <tr key={a.id_aluno} style={{ opacity: a.status === "inativo" ? 0.65 : 1 }}>
                <td>{a.id_aluno}</td>
                <td>{a.nome}</td>
                <td>{a.email || "—"}</td>
                <td>{a.telefone || "—"}</td>
                <td>
                  <Badge bg={a.status === "ativo" ? "success" : "secondary"}>
                    {a.status}
                  </Badge>
                </td>
                <td>
                  {a.data_cadastro
                    ? new Date(a.data_cadastro).toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEdicao(a)}>
                    Editar
                  </Button>
                  {a.status === "ativo" ? (
                    <Button size="sm" variant="outline-warning" className="me-1" onClick={() => inativar(a)}>
                      Inativar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline-success" className="me-1" onClick={() => reativar(a)}>
                      Reativar
                    </Button>
                  )}
                  <Button size="sm" variant="outline-danger" onClick={() => deletar(a)}>
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={salvar}>
          <Modal.Header closeButton>
            <Modal.Title>{editando ? "Editar Aluno" : "Novo Aluno"}</Modal.Title>
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
              <Form.Label>Data de Nascimento</Form.Label>
              <Form.Control type="date" value={form.data_nascimento} onChange={e => setForm({ ...form, data_nascimento: e.target.value })} />
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

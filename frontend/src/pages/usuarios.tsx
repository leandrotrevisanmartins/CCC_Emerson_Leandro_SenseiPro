import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Badge, Spinner, Row, Col } from "react-bootstrap";
import api from "./services/api";

interface UsuarioInterface {
  id_usuario?: number;
  email: string;
  perfil: string;
}

const perfilVariant: Record<string, string> = {
  admin: "danger",
  professor: "primary",
  aluno: "success",
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [usuarioReset, setUsuarioReset] = useState<UsuarioInterface | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    email: "",
    perfil: "aluno",
    nome: "",
    telefone: "",
    especialidade: "",
  });

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await api.get<UsuarioInterface[]>("/usuarios");
      setUsuarios(res.data);
    } catch {
      setErro("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirModal = () => {
    setForm({ email: "", perfil: "aluno", nome: "", telefone: "", especialidade: "" });
    setShowModal(true);
  };

  const criarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await api.post<{
        message: string;
        usuario: UsuarioInterface;
        registro: { tipo: string; id: number; nome: string } | null;
        senha_padrao: string;
      }>("/usuarios", form);

      setShowModal(false);
      setForm({ email: "", perfil: "aluno", nome: "", telefone: "", especialidade: "" });

      const registro = res.data.registro;
      let msg = `Usuário "${res.data.usuario.email}" criado. Senha padrão: "${res.data.senha_padrao}".`;
      if (registro) {
        msg += ` ${registro.tipo === "aluno" ? "Aluno" : "Professor"} "${registro.nome}" cadastrado automaticamente.`;
      }
      setSucesso(msg);
      carregar();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setErro("Este email já está cadastrado.");
      } else {
        setErro(err?.response?.data?.error || "Erro ao criar usuário.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const resetarSenha = async () => {
    if (!usuarioReset?.id_usuario) return;
    setSalvando(true);
    try {
      const res = await api.patch<{ message: string; senha_padrao: string }>(
        `/usuarios/${usuarioReset.id_usuario}/resetar-senha`
      );
      setShowResetModal(false);
      setSucesso(`Senha de "${usuarioReset.email}" resetada para "${res.data.senha_padrao}".`);
    } catch {
      setErro("Erro ao resetar senha.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (usuario: UsuarioInterface) => {
    if (!confirm(`Excluir o usuário "${usuario.email}"?`)) return;
    try {
      await api.delete(`/usuarios/${usuario.id_usuario}`);
      setSucesso(`Usuário "${usuario.email}" excluído.`);
      carregar();
    } catch {
      setErro("Erro ao excluir usuário.");
    }
  };

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="fw-bold mb-0">👤 Usuários de Acesso</h4>
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            Novos usuários recebem a senha padrão <code>password</code>
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="dark" size="sm" onClick={abrirModal}>
            + Novo Usuário
          </Button>
        </Col>
      </Row>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
      {sucesso && <Alert variant="success" dismissible onClose={() => setSucesso("")}>{sucesso}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Email</th><th>Perfil</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : usuarios.map(u => (
              <tr key={u.id_usuario}>
                <td>{u.id_usuario}</td>
                <td>{u.email}</td>
                <td>
                  <Badge bg={perfilVariant[u.perfil] || "secondary"}>{u.perfil}</Badge>
                </td>
                <td>
                  <Button size="sm" variant="outline-warning" className="me-1"
                    onClick={() => { setUsuarioReset(u); setShowResetModal(true); }}>
                    Resetar Senha
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => deletar(u)}>
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal criar usuário */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={criarUsuario}>
          <Modal.Header closeButton>
            <Modal.Title>Novo Usuário de Acesso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info" style={{ fontSize: "13px" }}>
              O usuário será criado com a senha padrão <strong>password</strong>.
              {form.perfil !== "admin" && (
                <> Um registro de <strong>{form.perfil}</strong> será criado automaticamente.</>
              )}
            </Alert>

            {/* Perfil primeiro — define os campos extras */}
            <Form.Group className="mb-3">
              <Form.Label>Perfil *</Form.Label>
              <Form.Select
                value={form.perfil}
                onChange={e => setForm({ ...form, perfil: e.target.value })}
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email" required placeholder="email@exemplo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </Form.Group>

            {/* Campos extras para aluno e professor */}
            {form.perfil !== "admin" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Nome completo *</Form.Label>
                  <Form.Control
                    required
                    placeholder={`Nome do ${form.perfil}`}
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    placeholder="54999990000"
                    value={form.telefone}
                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                  />
                </Form.Group>

                {/* Campo especialidade apenas para professor */}
                {form.perfil === "professor" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Especialidade</Form.Label>
                    <Form.Control
                      placeholder="Ex: Jiu-Jitsu Faixa Preta"
                      value={form.especialidade}
                      onChange={e => setForm({ ...form, especialidade: e.target.value })}
                    />
                  </Form.Group>
                )}
              </>
            )}

            {/* Para admin, apenas email */}
            {form.perfil === "admin" && (
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  placeholder="Nome do administrador (opcional)"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button variant="dark" type="submit" disabled={salvando}>
              {salvando ? "Criando..." : "Criar Usuário"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal reset de senha */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
        <Modal.Header closeButton><Modal.Title>Resetar Senha</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>Deseja resetar a senha de <strong>{usuarioReset?.email}</strong>?</p>
          <p className="text-muted" style={{ fontSize: "13px" }}>
            A senha será redefinida para <code>password</code>.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>Cancelar</Button>
          <Button variant="warning" onClick={resetarSenha} disabled={salvando}>
            {salvando ? "Resetando..." : "Confirmar Reset"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

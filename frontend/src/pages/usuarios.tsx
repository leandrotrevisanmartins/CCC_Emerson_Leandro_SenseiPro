import { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Alert, Badge, Spinner, Row, Col,
} from "react-bootstrap";
import { UsuarioInterface } from "./interfaces";
import { usuarioService } from "./services/usuarioService";

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

  // Modal de criação
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", perfil: "aluno" });
  const [salvando, setSalvando] = useState(false);

  // Modal de confirmação de reset de senha
  const [showResetModal, setShowResetModal] = useState(false);
  const [usuarioReset, setUsuarioReset] = useState<UsuarioInterface | null>(null);

  const carregar = async () => {
    try {
      setLoading(true);
      setUsuarios(await usuarioService.getAll());
    } catch {
      setErro("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const criarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const resultado = await usuarioService.create(form);
      setShowModal(false);
      setForm({ email: "", perfil: "aluno" });
      setSucesso(
        `Usuário "${resultado.usuario.email}" criado com sucesso. ` +
        `Senha padrão: "${resultado.senha_padrao}"`
      );
      carregar();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setErro("Este email já está cadastrado.");
      } else {
        setErro("Erro ao criar usuário.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const confirmarReset = (usuario: UsuarioInterface) => {
    setUsuarioReset(usuario);
    setShowResetModal(true);
  };

  const resetarSenha = async () => {
    if (!usuarioReset?.id_usuario) return;
    setSalvando(true);
    try {
      const resultado = await usuarioService.resetarSenha(usuarioReset.id_usuario);
      setShowResetModal(false);
      setSucesso(
        `Senha de "${usuarioReset.email}" resetada. ` +
        `Nova senha padrão: "${resultado.senha_padrao}"`
      );
    } catch {
      setErro("Erro ao resetar senha.");
    } finally {
      setSalvando(false);
    }
  };

  const deletar = async (usuario: UsuarioInterface) => {
    if (!confirm(`Excluir o usuário "${usuario.email}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await usuarioService.delete(usuario.id_usuario!);
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
            Usuários criados recebem a senha padrão <code>password</code>
          </p>
        </Col>
        <Col xs="auto">
          <Button
            variant="dark"
            size="sm"
            onClick={() => { setForm({ email: "", perfil: "aluno" }); setShowModal(true); }}
          >
            + Novo Usuário
          </Button>
        </Col>
      </Row>

      {erro && (
        <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>
      )}
      {sucesso && (
        <Alert variant="success" dismissible onClose={() => setSucesso("")}>{sucesso}</Alert>
      )}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
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
                  <Badge bg={perfilVariant[u.perfil] || "secondary"}>
                    {u.perfil}
                  </Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-warning"
                    className="me-1"
                    onClick={() => confirmarReset(u)}
                    title="Resetar senha para 'password'"
                  >
                    Resetar Senha
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => deletar(u)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* ── Modal criar usuário ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={criarUsuario}>
          <Modal.Header closeButton>
            <Modal.Title>Novo Usuário de Acesso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="info" style={{ fontSize: "13px" }}>
              O usuário será criado com a senha padrão <strong>password</strong>.
              Oriente o usuário a alterá-la após o primeiro acesso.
            </Alert>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                required
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              <Form.Text className="text-muted">
                Use o mesmo email cadastrado no perfil do aluno ou professor.
              </Form.Text>
            </Form.Group>
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
              <Form.Text className="text-muted">
                Alunos acessam apenas seus próprios dados. Professores podem
                registrar presenças e graduações. Admins têm acesso total.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="dark" type="submit" disabled={salvando}>
              {salvando ? "Criando..." : "Criar Usuário"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ── Modal confirmar reset de senha ── */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Resetar Senha</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Deseja resetar a senha de <strong>{usuarioReset?.email}</strong>?
          </p>
          <p className="text-muted" style={{ fontSize: "13px" }}>
            A senha será redefinida para <code>password</code>. O usuário precisará
            usar essa senha no próximo login.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning" onClick={resetarSenha} disabled={salvando}>
            {salvando ? "Resetando..." : "Confirmar Reset"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import authService from "../services/authService";
import api from "../services/api";

const NavbarTop = () => {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ email: string; perfil: string } | null>(null);
  const [showSenhaModal, setShowSenhaModal] = useState(false);
  const [formSenha, setFormSenha] = useState({ senha_atual: "", nova_senha: "", confirmar_senha: "" });
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    const dados = localStorage.getItem("usuario");
    if (dados) setUsuario(JSON.parse(dados));
  }, []);

  const handleLogout = () => { authService.logout(); router.push("/login"); };

  const abrirTrocarSenha = () => {
    setFormSenha({ senha_atual: "", nova_senha: "", confirmar_senha: "" });
    setErroSenha(""); setSucessoSenha(""); setShowSenhaModal(true);
  };

  const trocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroSenha("");
    if (formSenha.nova_senha !== formSenha.confirmar_senha) { setErroSenha("As senhas não coincidem."); return; }
    if (formSenha.nova_senha.length < 6) { setErroSenha("A nova senha deve ter pelo menos 6 caracteres."); return; }
    setSalvandoSenha(true);
    try {
      await api.patch("/minha-senha", { senha_atual: formSenha.senha_atual, nova_senha: formSenha.nova_senha });
      setSucessoSenha("Senha alterada com sucesso!");
      setFormSenha({ senha_atual: "", nova_senha: "", confirmar_senha: "" });
    } catch (err: any) {
      setErroSenha(err?.response?.data?.error || "Erro ao alterar senha.");
    } finally { setSalvandoSenha(false); }
  };

  const perfil = usuario?.perfil;
  const isAdmin = perfil === "admin";
  const isAluno = perfil === "aluno";
  const isProfessor = perfil === "professor";

  const userMenu = (
    <NavDropdown
      title={<span style={{ fontSize: "0.85rem", color: "#fff" }}>
        {usuario?.email} <span className="badge bg-secondary">{usuario?.perfil}</span>
      </span>}
      id="user-dropdown" align="end"
    >
      <NavDropdown.Item onClick={abrirTrocarSenha}>🔑 Trocar Senha</NavDropdown.Item>
      <NavDropdown.Divider />
      <NavDropdown.Item onClick={handleLogout} style={{ color: "#dc3545" }}>Sair</NavDropdown.Item>
    </NavDropdown>
  );

  return (
    <>
      <Navbar bg="dark" expand="md" data-bs-theme="dark" fixed="top">
        <Container>
          <Navbar.Brand as={Link} href={isAluno ? "/aluno/dashboard" : isProfessor ? "/professor/dashboard" : "/"}>
            🥋 SenseiPro
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">

            {isAdmin && (
              <Nav className="me-auto">
                <Nav.Link as={Link} href="/alunos">Alunos</Nav.Link>
                <Nav.Link as={Link} href="/professores">Professores</Nav.Link>
                <Nav.Link as={Link} href="/turmas">Turmas</Nav.Link>
                <Nav.Link as={Link} href="/presencas">Presenças</Nav.Link>
                <NavDropdown title="Financeiro" id="fin-dropdown">
                  <NavDropdown.Item as={Link} href="/mensalidades">Mensalidades</NavDropdown.Item>
                </NavDropdown>
                <Nav.Link as={Link} href="/graduacoes">Graduações</Nav.Link>
                <NavDropdown title="Configurações" id="config-dropdown">
                  <NavDropdown.Item as={Link} href="/usuarios">Usuários de Acesso</NavDropdown.Item>
                  <NavDropdown.Item as={Link} href="/modalidades">Modalidades</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} href="/logs">Logs de Auditoria</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            )}

            {isProfessor && (
              <Nav className="me-auto">
                <Nav.Link as={Link} href="/professor/dashboard">Início</Nav.Link>
                <Nav.Link as={Link} href="/professor/minhas-turmas">Minhas Turmas</Nav.Link>
                <Nav.Link as={Link} href="/professor/registrar-presenca">Registrar Presença</Nav.Link>
                <Nav.Link as={Link} href="/professor/alunos">Alunos</Nav.Link>
                <Nav.Link as={Link} href="/professor/graduacoes">Graduações</Nav.Link>
              </Nav>
            )}

            {isAluno && (
              <Nav className="me-auto">
                <Nav.Link as={Link} href="/aluno/dashboard">Início</Nav.Link>
                <Nav.Link as={Link} href="/aluno/minhas-turmas">Minhas Turmas</Nav.Link>
                <Nav.Link as={Link} href="/aluno/minhas-presencas">Minhas Presenças</Nav.Link>
                <Nav.Link as={Link} href="/aluno/minhas-mensalidades">Financeiro</Nav.Link>
                <Nav.Link as={Link} href="/aluno/minhas-graduacoes">Graduações</Nav.Link>
              </Nav>
            )}

            <Nav className="ms-auto">{usuario && userMenu}</Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showSenhaModal} onHide={() => setShowSenhaModal(false)}>
        <Form onSubmit={trocarSenha}>
          <Modal.Header closeButton><Modal.Title>🔑 Trocar Senha</Modal.Title></Modal.Header>
          <Modal.Body>
            {erroSenha && <Alert variant="danger" dismissible onClose={() => setErroSenha("")}>{erroSenha}</Alert>}
            {sucessoSenha && <Alert variant="success">{sucessoSenha}</Alert>}
            {!sucessoSenha && (<>
              <Form.Group className="mb-3">
                <Form.Label>Senha atual *</Form.Label>
                <Form.Control type="password" required placeholder="Senha atual"
                  value={formSenha.senha_atual} onChange={e => setFormSenha({ ...formSenha, senha_atual: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nova senha *</Form.Label>
                <Form.Control type="password" required placeholder="Mínimo 6 caracteres"
                  value={formSenha.nova_senha} onChange={e => setFormSenha({ ...formSenha, nova_senha: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirmar nova senha *</Form.Label>
                <Form.Control type="password" required placeholder="Repita a nova senha"
                  value={formSenha.confirmar_senha} onChange={e => setFormSenha({ ...formSenha, confirmar_senha: e.target.value })} />
              </Form.Group>
            </>)}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSenhaModal(false)}>
              {sucessoSenha ? "Fechar" : "Cancelar"}
            </Button>
            {!sucessoSenha && (
              <Button variant="dark" type="submit" disabled={salvandoSenha}>
                {salvandoSenha ? "Salvando..." : "Alterar Senha"}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default NavbarTop;

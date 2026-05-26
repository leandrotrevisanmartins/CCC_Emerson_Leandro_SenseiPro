import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import authService from "../services/authService";

const NavbarTop = () => {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ email: string; perfil: string } | null>(null);

  useEffect(() => {
    const dados = localStorage.getItem("usuario");
    if (dados) setUsuario(JSON.parse(dados));
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  const isAluno = usuario?.perfil === "aluno";

  return (
    <Navbar bg="dark" expand="md" data-bs-theme="dark" fixed="top">
      <Container>
        <Navbar.Brand as={Link} href={isAluno ? "/aluno/dashboard" : "/"}>
          🥋 SenseiPro
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">

          {/* Menu do aluno — restrito */}
          {isAluno && (
            <Nav className="me-auto">
              <Nav.Link as={Link} href="/aluno/dashboard">Início</Nav.Link>
              <Nav.Link as={Link} href="/aluno/minhas-turmas">Minhas Turmas</Nav.Link>
              <Nav.Link as={Link} href="/aluno/minhas-presencas">Minhas Presenças</Nav.Link>
              <Nav.Link as={Link} href="/aluno/minhas-mensalidades">Financeiro</Nav.Link>
              <Nav.Link as={Link} href="/aluno/minhas-graduacoes">Graduações</Nav.Link>
            </Nav>
          )}

          {/* Menu do admin/professor — completo */}
          {!isAluno && (
            <Nav className="me-auto">
              <Nav.Link as={Link} href="/alunos">Alunos</Nav.Link>
              <Nav.Link as={Link} href="/professores">Professores</Nav.Link>
              <Nav.Link as={Link} href="/turmas">Turmas</Nav.Link>
              <Nav.Link as={Link} href="/presencas">Presenças</Nav.Link>
              <NavDropdown title="Financeiro" id="fin-dropdown">
                <NavDropdown.Item as={Link} href="/mensalidades">Mensalidades</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} href="/graduacoes">Graduações</Nav.Link>
            </Nav>
          )}

          <Nav className="ms-auto align-items-center">
            {usuario && (
              <Navbar.Text className="me-3 text-light" style={{ fontSize: "0.85rem" }}>
                {usuario.email} ·{" "}
                <span className="badge bg-secondary">{usuario.perfil}</span>
              </Navbar.Text>
            )}
            <Nav.Link
              onClick={handleLogout}
              style={{ cursor: "pointer", color: "#dc3545" }}
            >
              Sair
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarTop;

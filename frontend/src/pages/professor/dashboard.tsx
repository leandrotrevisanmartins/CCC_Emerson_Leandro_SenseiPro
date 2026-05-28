import { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import api from "../services/api";

export default function ProfessorDashboard() {
  const [perfil, setPerfil] = useState<any>(null);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([api.get("/me/perfil"), api.get("/me/turmas")])
      .then(([p, t]) => { setPerfil(p.data.dados); setTurmas(t.data); })
      .catch(() => setErro("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div className="py-3">
      {erro && <Alert variant="danger">{erro}</Alert>}
      <div className="mb-4">
        <h4 className="fw-bold">Olá, {perfil?.nome?.split(" ")[0]} 👋</h4>
        <p className="text-muted">Área do professor — {perfil?.especialidade || ""}</p>
      </div>
      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem" }}>📅</div>
            <div style={{ fontSize: "24px", fontWeight: 500, marginTop: 4 }}>{turmas.length}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>turma(s) sob responsabilidade</div>
          </div>
        </Col>
      </Row>
      <Row className="g-3">
        {[
          { href: "/professor/minhas-turmas", icon: "📅", titulo: "Minhas Turmas", desc: "Turmas que ministro" },
          { href: "/professor/registrar-presenca", icon: "✅", titulo: "Registrar Presença", desc: "Marcar presença dos alunos" },
          { href: "/professor/alunos", icon: "🥋", titulo: "Alunos", desc: "Ver alunos das minhas turmas" },
          { href: "/professor/graduacoes", icon: "🥇", titulo: "Graduações", desc: "Registrar evolução dos alunos" },
        ].map(m => (
          <Col key={m.href} xs={12} sm={6}>
            <Card className="modulo-card h-100" onClick={() => window.location.href = m.href}>
              <Card.Body className="d-flex align-items-center gap-3 p-4">
                <div style={{ fontSize: "2rem" }}>{m.icon}</div>
                <div>
                  <Card.Title className="mb-1 fw-bold" style={{ fontSize: "1rem" }}>{m.titulo}</Card.Title>
                  <Card.Text className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>{m.desc}</Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

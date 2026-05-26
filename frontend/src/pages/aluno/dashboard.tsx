import { useEffect, useState } from "react";
import { Row, Col, Card, Badge, Spinner, Alert } from "react-bootstrap";
import { AlunoInterface, MensalidadeInterface, GraduacaoInterface } from "../interfaces";
import { meService } from "../services/meService";

export default function AlunoDashboard() {
  const [perfil, setPerfil] = useState<AlunoInterface | null>(null);
  const [mensalidades, setMensalidades] = useState<MensalidadeInterface[]>([]);
  const [graduacoes, setGraduacoes] = useState<GraduacaoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        const [p, m, g] = await Promise.all([
          meService.getPerfil(),
          meService.getMinhasMensalidades(),
          meService.getMinhasGraduacoes(),
        ]);
        setPerfil(p);
        setMensalidades(m);
        setGraduacoes(g);
      } catch {
        setErro("Erro ao carregar dados. Verifique se seu perfil está vinculado a um aluno.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const pendentes = mensalidades.filter(m => m.status === "pendente" || m.status === "atrasado");
  const faixaAtual = graduacoes[0]?.faixa || "Sem graduação registrada";

  return (
    <div className="py-3">
      {erro && <Alert variant="danger">{erro}</Alert>}

      <div className="mb-4">
        <h4 className="fw-bold">Olá, {perfil?.nome?.split(" ")[0]} 👋</h4>
        <p className="text-muted">Bem-vindo à sua área do aluno.</p>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem" }}>🥋</div>
            <div style={{ fontSize: "20px", fontWeight: 500, marginTop: 4 }}>{faixaAtual}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: 2 }}>faixa atual</div>
          </div>
        </Col>
        <Col xs={12} sm={4}>
          <div style={{ background: pendentes.length > 0 ? "var(--color-background-danger)" : "var(--color-background-success)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem" }}>{pendentes.length > 0 ? "⚠️" : "✅"}</div>
            <div style={{ fontSize: "20px", fontWeight: 500, color: pendentes.length > 0 ? "var(--color-text-danger)" : "var(--color-text-success)", marginTop: 4 }}>
              {pendentes.length}
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: 2 }}>mensalidade(s) pendente(s)</div>
          </div>
        </Col>
        <Col xs={12} sm={4}>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem" }}>🎖️</div>
            <div style={{ fontSize: "20px", fontWeight: 500, marginTop: 4 }}>{graduacoes.length}</div>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: 2 }}>graduação(ões) registrada(s)</div>
          </div>
        </Col>
      </Row>

      {pendentes.length > 0 && (
        <Alert variant="warning">
          Você possui <strong>{pendentes.length}</strong> mensalidade(s) com pagamento pendente.
          Acesse <a href="/aluno/minhas-mensalidades">Financeiro</a> para mais detalhes.
        </Alert>
      )}

      <Row className="g-3">
        {[
          { href: "/aluno/minhas-turmas", icon: "📅", titulo: "Minhas Turmas", desc: "Turmas em que estou matriculado" },
          { href: "/aluno/minhas-presencas", icon: "✅", titulo: "Minhas Presenças", desc: "Histórico de frequência" },
          { href: "/aluno/minhas-mensalidades", icon: "💰", titulo: "Financeiro", desc: "Mensalidades e pagamentos" },
          { href: "/aluno/minhas-graduacoes", icon: "🥇", titulo: "Graduações", desc: "Histórico de faixas" },
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

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";

const modulos = [
  { href: "/alunos",       icon: "🥋", titulo: "Alunos",            desc: "Cadastro e gestão de alunos" },
  { href: "/professores",  icon: "👨‍🏫", titulo: "Professores",       desc: "Cadastro de professores" },
  { href: "/turmas",       icon: "📅", titulo: "Turmas",             desc: "Turmas, modalidades e matrículas" },
  { href: "/presencas",    icon: "✅", titulo: "Presenças",          desc: "Registro de frequência" },
  { href: "/mensalidades", icon: "💰", titulo: "Mensalidades",       desc: "Controle financeiro" },
  { href: "/graduacoes",   icon: "🥇", titulo: "Graduações",         desc: "Histórico de faixas" },
  { href: "/usuarios",     icon: "👤", titulo: "Usuários de Acesso", desc: "Gerenciar acessos ao sistema" },
];

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const dados = localStorage.getItem("usuario");
    if (dados) setUsuario(JSON.parse(dados));
  }, []);

  return (
    <div className="py-4">
      <div className="mb-4">
        <h4 className="fw-bold">
          Bem-vindo, {usuario?.email?.split("@")[0]} 👋
        </h4>
        <p className="text-muted">O que você quer gerenciar hoje?</p>
      </div>
      <Row className="g-3">
        {modulos.map((m) => (
          <Col key={m.href} xs={12} sm={6} md={4}>
            <Card
              className="modulo-card h-100"
              onClick={() => router.push(m.href)}
            >
              <Card.Body className="d-flex align-items-center gap-3 p-4">
                <div style={{ fontSize: "2rem" }}>{m.icon}</div>
                <div>
                  <Card.Title className="mb-1 fw-bold" style={{ fontSize: "1rem" }}>
                    {m.titulo}
                  </Card.Title>
                  <Card.Text className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                    {m.desc}
                  </Card.Text>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

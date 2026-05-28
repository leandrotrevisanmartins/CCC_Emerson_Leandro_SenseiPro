import { useEffect, useState } from "react";
import { Card, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import api from "../services/api";

export default function MinhasTurmas() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.get("/me/turmas").then(r => setTurmas(r.data))
      .catch(() => setErro("Erro ao carregar turmas."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">📅 Minhas Turmas</h4>
      {erro && <Alert variant="danger">{erro}</Alert>}
      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div>
        : turmas.length === 0 ? <p className="text-muted">Você não está matriculado em nenhuma turma.</p>
        : (
          <Row className="g-3">
            {turmas.map((t: any) => (
              <Col key={t.id_turma} xs={12} sm={6} md={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title style={{ fontSize: "1rem" }}>{t.nome}</Card.Title>
                      <Badge bg="info" text="dark">{t.modalidade?.nome}</Badge>
                    </div>
                    <p className="text-muted mb-1" style={{ fontSize: "13px" }}>👨‍🏫 {t.professor?.nome}</p>
                    <p className="text-muted mb-0" style={{ fontSize: "13px" }}>🕐 {t.horario} · {t.dia_semana}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
    </div>
  );
}

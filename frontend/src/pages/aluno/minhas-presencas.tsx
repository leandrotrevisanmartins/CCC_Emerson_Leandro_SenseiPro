import { useEffect, useState } from "react";
import { Table, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import { PresencaInterface } from "../interfaces";
import { meService } from "../services/meService";

export default function MinhasPresencas() {
  const [presencas, setPresencas] = useState<PresencaInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    meService.getMinhasPresencas()
      .then(setPresencas)
      .catch(() => setErro("Erro ao carregar presenças."))
      .finally(() => setLoading(false));
  }, []);

  const totalPresente = presencas.filter(p => p.presente).length;
  const percentual = presencas.length > 0
    ? Math.round((totalPresente / presencas.length) * 100)
    : 0;

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">✅ Minhas Presenças</h4>
      {erro && <Alert variant="danger">{erro}</Alert>}

      {!loading && presencas.length > 0 && (
        <Row className="g-3 mb-4">
          <Col xs={4}>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 500 }}>{presencas.length}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>total de aulas</div>
            </div>
          </Col>
          <Col xs={4}>
            <div style={{ background: "var(--color-background-success)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 500, color: "var(--color-text-success)" }}>{totalPresente}</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>presenças</div>
            </div>
          </Col>
          <Col xs={4}>
            <div style={{ background: percentual >= 75 ? "var(--color-background-success)" : "var(--color-background-warning)", borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 500, color: percentual >= 75 ? "var(--color-text-success)" : "var(--color-text-warning)" }}>{percentual}%</div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>frequência</div>
            </div>
          </Col>
        </Row>
      )}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : presencas.length === 0 ? (
        <p className="text-muted">Nenhum registro de presença encontrado.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>Data</th><th>Turma</th><th>Modalidade</th><th>Presença</th></tr>
          </thead>
          <tbody>
            {presencas.map(p => (
              <tr key={p.id_presenca}>
                <td>{new Date(p.data).toLocaleDateString("pt-BR")}</td>
                <td>{p.turma.nome}</td>
                <td>{p.turma.modalidade?.nome || "—"}</td>
                <td><Badge bg={p.presente ? "success" : "danger"}>{p.presente ? "Presente" : "Ausente"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

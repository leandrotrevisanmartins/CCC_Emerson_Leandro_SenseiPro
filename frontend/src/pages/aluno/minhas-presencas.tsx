import { useEffect, useState } from "react";
import { Table, Badge, Spinner, Alert, Row, Col } from "react-bootstrap";
import api from "../services/api";

export default function MinhasPresencas() {
  const [presencas, setPresencas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.get("/me/presencas").then(r => setPresencas(r.data))
      .catch(() => setErro("Erro ao carregar presenças."))
      .finally(() => setLoading(false));
  }, []);

  const totalPresente = presencas.filter(p => p.presente).length;
  const percentual = presencas.length > 0 ? Math.round((totalPresente / presencas.length) * 100) : 0;

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">✅ Minhas Presenças</h4>
      {erro && <Alert variant="danger">{erro}</Alert>}
      {!loading && presencas.length > 0 && (
        <Row className="g-3 mb-4">
          {[
            { v: presencas.length, l: "total de aulas", c: "var(--color-background-secondary)", tc: "var(--color-text-primary)" },
            { v: totalPresente, l: "presenças", c: "var(--color-background-success)", tc: "var(--color-text-success)" },
            { v: `${percentual}%`, l: "frequência", c: percentual >= 75 ? "var(--color-background-success)" : "var(--color-background-warning)", tc: percentual >= 75 ? "var(--color-text-success)" : "var(--color-text-warning)" },
          ].map((s, i) => (
            <Col key={i} xs={4}>
              <div style={{ background: s.c, borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 500, color: s.tc }}>{s.v}</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{s.l}</div>
              </div>
            </Col>
          ))}
        </Row>
      )}
      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div>
        : presencas.length === 0 ? <p className="text-muted">Nenhum registro de presença.</p>
        : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr><th>Data</th><th>Turma</th><th>Modalidade</th><th>Presença</th></tr>
            </thead>
            <tbody>
              {presencas.map((p: any) => (
                <tr key={p.id_presenca}>
                  <td>{new Date(p.data).toLocaleDateString("pt-BR")}</td>
                  <td>{p.turma?.nome}</td>
                  <td>{p.turma?.modalidade?.nome || "—"}</td>
                  <td><Badge bg={p.presente ? "success" : "danger"}>{p.presente ? "Presente" : "Ausente"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
    </div>
  );
}

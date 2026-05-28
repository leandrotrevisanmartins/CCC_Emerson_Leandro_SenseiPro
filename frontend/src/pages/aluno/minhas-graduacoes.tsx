import { useEffect, useState } from "react";
import { Table, Badge, Spinner, Alert } from "react-bootstrap";
import api from "../services/api";

export default function MinhasGraduacoes() {
  const [graduacoes, setGraduacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.get("/me/graduacoes").then(r => setGraduacoes(r.data))
      .catch(() => setErro("Erro ao carregar graduações."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">🥇 Minhas Graduações</h4>
      {erro && <Alert variant="danger">{erro}</Alert>}
      {!loading && graduacoes.length > 0 && (
        <div className="mb-4 p-3" style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", display: "inline-block" }}>
          <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>Faixa atual: </span>
          <strong>{graduacoes[0].faixa}</strong>
          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginLeft: 8 }}>
            desde {new Date(graduacoes[0].data_graduacao).toLocaleDateString("pt-BR")}
          </span>
        </div>
      )}
      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div>
        : graduacoes.length === 0 ? <p className="text-muted">Nenhuma graduação registrada.</p>
        : (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr><th>#</th><th>Faixa</th><th>Data</th><th>Observação</th></tr>
            </thead>
            <tbody>
              {graduacoes.map((g: any, i: number) => (
                <tr key={g.id_graduacao}>
                  <td>{graduacoes.length - i}º</td>
                  <td><strong>{g.faixa}</strong>{i === 0 && <Badge bg="success" className="ms-2">atual</Badge>}</td>
                  <td>{new Date(g.data_graduacao).toLocaleDateString("pt-BR")}</td>
                  <td>{g.observacao || "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Table, Badge, Spinner, Alert } from "react-bootstrap";
import { MensalidadeInterface } from "../interfaces";
import { meService } from "../services/meService";

const statusVariant: Record<string, string> = {
  pendente: "warning",
  pago: "success",
  atrasado: "danger",
};

export default function MinhasMensalidades() {
  const [mensalidades, setMensalidades] = useState<MensalidadeInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    meService.getMinhasMensalidades()
      .then(setMensalidades)
      .catch(() => setErro("Erro ao carregar mensalidades."))
      .finally(() => setLoading(false));
  }, []);

  const pendentes = mensalidades.filter(m => m.status !== "pago");

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">💰 Financeiro</h4>
      {erro && <Alert variant="danger">{erro}</Alert>}

      {pendentes.length > 0 && (
        <Alert variant="warning" className="mb-3">
          Você possui <strong>{pendentes.length}</strong> mensalidade(s) com pagamento pendente ou em atraso.
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : mensalidades.length === 0 ? (
        <p className="text-muted">Nenhuma mensalidade registrada.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>Mês</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr>
          </thead>
          <tbody>
            {mensalidades.map(m => (
              <tr key={m.id_mensalidade}>
                <td>{m.mes_referencia}</td>
                <td>R$ {Number(m.valor).toFixed(2)}</td>
                <td>{new Date(m.data_vencimento).toLocaleDateString("pt-BR")}</td>
                <td><Badge bg={statusVariant[m.status]}>{m.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

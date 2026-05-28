import { useEffect, useState } from "react";
import { Table, Button, Form, Alert, Spinner, Badge, Row, Col, Card } from "react-bootstrap";
import api from "../services/api";

export default function RegistrarPresenca() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<any>(null);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [presencas, setPresencas] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    api.get("/me/turmas")
      .then(r => setTurmas(Array.isArray(r.data) ? r.data : []))
      .catch(() => setErro("Erro ao carregar turmas."))
      .finally(() => setLoading(false));
  }, []);

  const selecionarTurma = (turma: any) => {
    setTurmaSelecionada(turma);
    setSucesso("");
    setErro("");
    const mapa: Record<number, boolean> = {};
    (turma.alunos || []).forEach((a: any) => { mapa[a.id_aluno] = false; });
    setPresencas(mapa);
  };

  const salvarPresencas = async () => {
    if (!turmaSelecionada) return;
    setSalvando(true);
    setErro("");
    try {
      const alunos = turmaSelecionada.alunos || [];
      await Promise.all(
        alunos.map((a: any) =>
          api.post("/presencas", {
            id_aluno: a.id_aluno,
            id_turma: turmaSelecionada.id_turma,
            data,
            presente: presencas[a.id_aluno] ?? false,
          })
        )
      );
      setSucesso(
        `Presença registrada para ${alunos.length} aluno(s) em ${new Date(data + "T00:00:00").toLocaleDateString("pt-BR")}.`
      );
    } catch {
      setErro("Erro ao registrar presenças. Verifique se já não foram registradas para esta data.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">✅ Registrar Presença</h4>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}
      {sucesso && <Alert variant="success" dismissible onClose={() => setSucesso("")}>{sucesso}</Alert>}

      {!turmaSelecionada ? (
        <>
          <p className="text-muted mb-3">Selecione a turma para registrar presença:</p>
          {turmas.length === 0 ? (
            <p className="text-muted">Nenhuma turma atribuída.</p>
          ) : (
            <Row className="g-3">
              {turmas.map((t: any) => (
                <Col key={t.id_turma} xs={12} sm={6} md={4}>
                  <Card className="modulo-card h-100" onClick={() => selecionarTurma(t)}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title style={{ fontSize: "1rem" }}>{t.nome}</Card.Title>
                        <Badge bg="info" text="dark">{t.modalidade?.nome}</Badge>
                      </div>
                      <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                        🕐 {t.horario} · {t.dia_semana}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                        👥 {t.alunos?.length ?? 0} aluno(s)
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      ) : (
        <>
          <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
            <Button variant="outline-secondary" size="sm" onClick={() => setTurmaSelecionada(null)}>
              ← Voltar
            </Button>
            <h5 className="mb-0 fw-bold">{turmaSelecionada.nome}</h5>
            <Badge bg="info" text="dark">{turmaSelecionada.modalidade?.nome}</Badge>
            <Form.Control
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              style={{ width: "auto" }}
            />
          </div>

          {(turmaSelecionada.alunos || []).length === 0 ? (
            <Alert variant="warning">Nenhum aluno matriculado nesta turma.</Alert>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Aluno</th>
                    <th className="text-center" style={{ width: "120px" }}>Presente</th>
                  </tr>
                </thead>
                <tbody>
                  {(turmaSelecionada.alunos || []).map((a: any) => (
                    <tr key={a.id_aluno}>
                      <td>{a.nome}</td>
                      <td className="text-center">
                        <Form.Check
                          type="switch"
                          checked={presencas[a.id_aluno] ?? false}
                          onChange={e => setPresencas({ ...presencas, [a.id_aluno]: e.target.checked })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex gap-2 mt-2">
                <Button variant="outline-secondary" size="sm"
                  onClick={() => {
                    const todos: Record<number, boolean> = {};
                    (turmaSelecionada.alunos || []).forEach((a: any) => { todos[a.id_aluno] = true; });
                    setPresencas(todos);
                  }}>
                  Marcar todos
                </Button>
                <Button variant="dark" onClick={salvarPresencas} disabled={salvando}>
                  {salvando ? "Salvando..." : "Confirmar Presenças"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

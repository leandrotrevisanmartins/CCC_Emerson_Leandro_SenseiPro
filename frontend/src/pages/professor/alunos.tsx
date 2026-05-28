import { useEffect, useState } from "react";
import { Table, Spinner, Alert, Badge, Form, Row, Col } from "react-bootstrap";
import api from "../services/api";

export default function ProfessorAlunos() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api.get("/me/turmas")
      .then(r => setTurmas(Array.isArray(r.data) ? r.data : []))
      .catch(() => setErro("Erro ao carregar turmas."))
      .finally(() => setLoading(false));
  }, []);

  const alunos = turmaSelecionada
    ? (turmas.find(t => t.id_turma === turmaSelecionada)?.alunos || [])
    : turmas
        .flatMap((t: any) => t.alunos || [])
        .filter((a: any, i: number, arr: any[]) =>
          arr.findIndex(x => x.id_aluno === a.id_aluno) === i
        );

  return (
    <div className="py-3">
      <h4 className="fw-bold mb-4">🥋 Alunos</h4>
      {erro && <Alert variant="danger">{erro}</Alert>}
      <Row className="mb-3">
        <Col sm={4}>
          <Form.Select value={turmaSelecionada} onChange={e => setTurmaSelecionada(Number(e.target.value))}>
            <option value={0}>Todos os alunos</option>
            {turmas.map((t: any) => (
              <option key={t.id_turma} value={t.id_turma}>{t.nome}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : alunos.length === 0 ? (
        <p className="text-muted">Nenhum aluno encontrado.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr><th>#</th><th>Nome</th><th>Email</th><th>Status</th></tr>
          </thead>
          <tbody>
            {alunos.map((a: any) => (
              <tr key={a.id_aluno}>
                <td>{a.id_aluno}</td>
                <td>{a.nome}</td>
                <td>{a.email || "—"}</td>
                <td>
                  <Badge bg={a.status === "ativo" ? "success" : "secondary"}>{a.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Table, Spinner, Alert, Badge, Row, Col, Form, Button } from "react-bootstrap";
import api from "./services/api";

const acaoBadge: Record<string, string> = {
  LOGIN: "info",
  CRIAR_USUARIO: "success", DELETAR_USUARIO: "danger", RESETAR_SENHA: "warning", TROCAR_SENHA: "secondary",
  CRIAR_ALUNO: "success", DELETAR_ALUNO: "danger", INATIVAR_ALUNO: "warning",
  CRIAR_PROFESSOR: "success", DELETAR_PROFESSOR: "danger",
  CRIAR_TURMA: "success", DELETAR_TURMA: "danger",
  MATRICULAR_ALUNO: "primary", DESMATRICULAR_ALUNO: "secondary",
  REGISTRAR_PAGAMENTO: "success", PAGAMENTO_ALUNO: "success",
  REGISTRAR_GRADUACAO: "primary", DELETAR_GRADUACAO: "danger",
  CRIAR_MENSALIDADE: "success", DELETAR_MENSALIDADE: "danger",
};

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroAcao, setFiltroAcao] = useState("");
  const [filtroEntidade, setFiltroEntidade] = useState("");
  const [pagina, setPagina] = useState(1);
  const limite = 50;

  const carregar = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limite: String(limite),
        pagina: String(pagina),
        ...(filtroAcao && { acao: filtroAcao }),
        ...(filtroEntidade && { entidade: filtroEntidade }),
      });
      const r = await api.get(`/logs?${params}`);
      setLogs(r.data.logs || []);
      setTotal(r.data.total || 0);
    } catch { setErro("Erro ao carregar logs de auditoria."); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, [pagina, filtroAcao, filtroEntidade]);

  const acoes = [
    "LOGIN", "CRIAR_USUARIO", "DELETAR_USUARIO", "RESETAR_SENHA", "TROCAR_SENHA",
    "CRIAR_ALUNO", "DELETAR_ALUNO", "INATIVAR_ALUNO",
    "CRIAR_PROFESSOR", "DELETAR_PROFESSOR",
    "CRIAR_TURMA", "DELETAR_TURMA", "MATRICULAR_ALUNO", "DESMATRICULAR_ALUNO",
    "REGISTRAR_PAGAMENTO", "PAGAMENTO_ALUNO",
    "REGISTRAR_GRADUACAO", "DELETAR_GRADUACAO",
    "CRIAR_MENSALIDADE", "DELETAR_MENSALIDADE",
  ];

  const entidades = ["usuario", "aluno", "professor", "turma", "matricula", "pagamento", "graduacao", "mensalidade"];

  const totalPaginas = Math.ceil(total / limite);

  return (
    <div className="py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h4 className="fw-bold mb-0">🔍 Logs de Auditoria</h4>
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            {total} registro(s) encontrado(s)
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" size="sm" onClick={() => { setPagina(1); carregar(); }}>
            Atualizar
          </Button>
        </Col>
      </Row>

      {erro && <Alert variant="danger" dismissible onClose={() => setErro("")}>{erro}</Alert>}

      <Row className="mb-3 g-2">
        <Col sm={4}>
          <Form.Select value={filtroAcao} onChange={e => { setFiltroAcao(e.target.value); setPagina(1); }}>
            <option value="">Todas as ações</option>
            {acoes.map(a => <option key={a} value={a}>{a}</option>)}
          </Form.Select>
        </Col>
        <Col sm={3}>
          <Form.Select value={filtroEntidade} onChange={e => { setFiltroEntidade(e.target.value); setPagina(1); }}>
            <option value="">Todas as entidades</option>
            {entidades.map(e => <option key={e} value={e}>{e}</option>)}
          </Form.Select>
        </Col>
        {(filtroAcao || filtroEntidade) && (
          <Col xs="auto">
            <Button variant="outline-secondary" size="sm"
              onClick={() => { setFiltroAcao(""); setFiltroEntidade(""); setPagina(1); }}>
              Limpar
            </Button>
          </Col>
        )}
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Table striped bordered hover responsive style={{ fontSize: "12px" }}>
            <thead className="table-dark">
              <tr>
                <th style={{ width: "150px" }}>Data/Hora</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>Detalhes</th>
                <th style={{ width: "110px" }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Nenhum log encontrado.</td></tr>
              ) : logs.map((l: any) => (
                <tr key={l.id_log}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(l.criado_em).toLocaleString("pt-BR")}
                  </td>
                  <td>{l.email_usuario || "—"}</td>
                  <td>
                    <Badge bg={acaoBadge[l.acao] || "secondary"} style={{ fontSize: "10px" }}>
                      {l.acao}
                    </Badge>
                  </td>
                  <td>{l.entidade || "—"}</td>
                  <td>{l.detalhes || "—"}</td>
                  <td style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    {l.ip || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPaginas > 1 && (
            <div className="d-flex align-items-center gap-2 mt-2">
              <Button variant="outline-secondary" size="sm"
                disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>
                ← Anterior
              </Button>
              <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Página {pagina} de {totalPaginas}
              </span>
              <Button variant="outline-secondary" size="sm"
                disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>
                Próxima →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

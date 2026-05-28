import { useState } from "react";
import { useRouter } from "next/router";
import { Form, Button, Alert, Container, Row, Col, Card } from "react-bootstrap";
import authService from "./services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.login(email, password);
      router.push(authService.getRedirectPath());
    } catch {
      setError("Credenciais inválidas. Verifique seu email e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={5} lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div style={{ fontSize: "2.5rem" }}>🥋</div>
                <h4 className="fw-bold mt-2">SenseiPro</h4>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>Sistema de Gestão de Academia</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="seu@email.com" value={email}
                    onChange={e => setEmail(e.target.value)} required disabled={loading} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control type="password" placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)} required disabled={loading} />
                </Form.Group>
                <Button variant="dark" type="submit" className="w-100" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

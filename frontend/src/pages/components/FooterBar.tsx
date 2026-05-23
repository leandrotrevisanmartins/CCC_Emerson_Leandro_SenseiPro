import { Container, Navbar } from "react-bootstrap";
import HealthCheck from "./HealthCheck";
const FooterBar = () => (
  <Navbar bg="dark" data-bs-theme="dark" fixed="bottom" style={{ minHeight: "40px" }}>
    <Container>
      <Navbar.Text style={{ fontSize: "0.8rem", color: "#6c757d" }}>
        SenseiPro © {new Date().getFullYear()} — UPF
      </Navbar.Text>
      <Navbar.Brand className="ms-auto"><HealthCheck /></Navbar.Brand>
    </Container>
  </Navbar>
);
export default FooterBar;

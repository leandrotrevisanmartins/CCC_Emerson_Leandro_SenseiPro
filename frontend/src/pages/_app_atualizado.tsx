import { useRouter } from "next/router";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Container from "react-bootstrap/Container";
import NavbarTop from "./components/NavBar";
import FooterBar from "./components/FooterBar";
import authService from "./services/authService";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      if (!isLoginPage) router.push("/login");
      return;
    }

    // Redireciona para a área correta conforme perfil
    const dadosStr = localStorage.getItem("usuario");
    if (!dadosStr) return;
    const usuario = JSON.parse(dadosStr);

    const naAreaAluno = router.pathname.startsWith("/aluno");
    const naAreaAdmin = !naAreaAluno && !isLoginPage;

    // Aluno tentando acessar área de admin → redireciona para sua área
    if (usuario.perfil === "aluno" && naAreaAdmin) {
      router.push("/aluno/dashboard");
      return;
    }

    // Admin/professor tentando acessar área de aluno → redireciona para admin
    if (usuario.perfil !== "aluno" && naAreaAluno) {
      router.push("/");
    }
  }, [router, isLoginPage]);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {!isLoginPage && <NavbarTop />}
      <main className="flex-grow-1">
        <Container fluid className={!isLoginPage ? "page-content" : ""}>
          <Component {...pageProps} />
        </Container>
      </main>
      {!isLoginPage && <FooterBar />}
    </div>
  );
}

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
    if (!authService.isLoggedIn() && !isLoginPage) router.push("/login");
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

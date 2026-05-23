import axios from "axios";
import { AuthResponse } from "../interfaces";
const BASE_URL = "http://localhost:3001/api";
class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/login`, { email, password });
    const { token, usuario } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    return response.data;
  }
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }
  isLoggedIn(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  }
}
export default new AuthService();

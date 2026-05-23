import axios from "axios";
const BASE_URL = "http://localhost:3001/api";
export const getToken = (): string | null => {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
};
export const getUsuarioLogado = () => {
  if (typeof window !== "undefined") {
    const dados = localStorage.getItem("usuario");
    return dados ? JSON.parse(dados) : null;
  }
  return null;
};
const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default api;

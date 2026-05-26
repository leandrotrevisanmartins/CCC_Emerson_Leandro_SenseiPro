import api from "./api";
import { UsuarioInterface } from "../interfaces";

export const usuarioService = {
  getAll: () =>
    api.get<Omit<UsuarioInterface, "senha">[]>("/usuarios").then(r => r.data),

  create: (data: { email: string; perfil: string }) =>
    api.post<{ message: string; usuario: UsuarioInterface; senha_padrao: string }>(
      "/usuarios",
      data
    ).then(r => r.data),

  update: (id: number, data: Partial<UsuarioInterface>) =>
    api.put<UsuarioInterface>(`/usuarios/${id}`, data).then(r => r.data),

  resetarSenha: (id: number) =>
    api.patch<{ message: string; senha_padrao: string }>(
      `/usuarios/${id}/resetar-senha`
    ).then(r => r.data),

  delete: (id: number) => api.delete(`/usuarios/${id}`),
};

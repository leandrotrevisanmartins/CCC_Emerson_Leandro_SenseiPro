import api from "./api";
import {
  AlunoInterface,
  TurmaInterface,
  PresencaInterface,
  MensalidadeInterface,
  GraduacaoInterface,
} from "../interfaces";

// Endpoints exclusivos para o aluno autenticado
export const meService = {
  getPerfil: () => api.get<AlunoInterface>("/me/perfil").then(r => r.data),
  getMinhasTurmas: () => api.get<TurmaInterface[]>("/me/turmas").then(r => r.data),
  getMinhasPresencas: () => api.get<PresencaInterface[]>("/me/presencas").then(r => r.data),
  getMinhasMensalidades: () => api.get<MensalidadeInterface[]>("/me/mensalidades").then(r => r.data),
  getMinhasGraduacoes: () => api.get<GraduacaoInterface[]>("/me/graduacoes").then(r => r.data),
};

import api from "./api";
import { AlunoInterface, ProfessorInterface, ModalidadeInterface, TurmaInterface, PresencaInterface, MensalidadeInterface, PagamentoInterface, GraduacaoInterface } from "../interfaces";
export const alunoService = {
  getAll: () => api.get<AlunoInterface[]>("/alunos").then(r => r.data),
  getById: (id: number) => api.get<AlunoInterface>(`/alunos/${id}`).then(r => r.data),
  create: (data: Partial<AlunoInterface>) => api.post<AlunoInterface>("/alunos", data).then(r => r.data),
  update: (id: number, data: Partial<AlunoInterface>) => api.put<AlunoInterface>(`/alunos/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/alunos/${id}`).then(r => r.status),
};
export const professorService = {
  getAll: () => api.get<ProfessorInterface[]>("/professores").then(r => r.data),
  getById: (id: number) => api.get<ProfessorInterface>(`/professores/${id}`).then(r => r.data),
  create: (data: Partial<ProfessorInterface>) => api.post<ProfessorInterface>("/professores", data).then(r => r.data),
  update: (id: number, data: Partial<ProfessorInterface>) => api.put<ProfessorInterface>(`/professores/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/professores/${id}`).then(r => r.status),
};
export const modalidadeService = {
  getAll: () => api.get<ModalidadeInterface[]>("/modalidades").then(r => r.data),
  getById: (id: number) => api.get<ModalidadeInterface>(`/modalidades/${id}`).then(r => r.data),
  create: (data: Partial<ModalidadeInterface>) => api.post<ModalidadeInterface>("/modalidades", data).then(r => r.data),
  update: (id: number, data: Partial<ModalidadeInterface>) => api.put<ModalidadeInterface>(`/modalidades/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/modalidades/${id}`).then(r => r.status),
};
export const turmaService = {
  getAll: () => api.get<TurmaInterface[]>("/turmas").then(r => r.data),
  getById: (id: number) => api.get<TurmaInterface>(`/turmas/${id}`).then(r => r.data),
  create: (data: Partial<TurmaInterface> & { id_modalidade: number; id_professor: number }) => api.post<TurmaInterface>("/turmas", data).then(r => r.data),
  update: (id: number, data: Partial<TurmaInterface>) => api.put<TurmaInterface>(`/turmas/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/turmas/${id}`).then(r => r.status),
  matricular: (id_turma: number, id_aluno: number) => api.post(`/turmas/${id_turma}/matricular`, { id_aluno }).then(r => r.data),
  desmatricular: (id_turma: number, id_aluno: number) => api.delete(`/turmas/${id_turma}/aluno/${id_aluno}`).then(r => r.data),
};
export const presencaService = {
  getAll: () => api.get<PresencaInterface[]>("/presencas").then(r => r.data),
  getByAluno: (id: number) => api.get<PresencaInterface[]>(`/presencas/aluno/${id}`).then(r => r.data),
  getByTurma: (id: number) => api.get<PresencaInterface[]>(`/presencas/turma/${id}`).then(r => r.data),
  create: (data: { id_aluno: number; id_turma: number; data: string; presente: boolean }) => api.post<PresencaInterface>("/presencas", data).then(r => r.data),
  update: (id: number, data: Partial<PresencaInterface>) => api.put<PresencaInterface>(`/presencas/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/presencas/${id}`).then(r => r.status),
};
export const mensalidadeService = {
  getAll: () => api.get<MensalidadeInterface[]>("/mensalidades").then(r => r.data),
  getByAluno: (id: number) => api.get<MensalidadeInterface[]>(`/mensalidades/aluno/${id}`).then(r => r.data),
  getInadimplentes: () => api.get<MensalidadeInterface[]>("/mensalidades/inadimplentes").then(r => r.data),
  create: (data: { id_aluno: number; mes_referencia: string; valor: number; data_vencimento: string }) => api.post<MensalidadeInterface>("/mensalidades", data).then(r => r.data),
  update: (id: number, data: Partial<MensalidadeInterface>) => api.put<MensalidadeInterface>(`/mensalidades/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/mensalidades/${id}`).then(r => r.status),
};
export const pagamentoService = {
  getByMensalidade: (id: number) => api.get<PagamentoInterface[]>(`/pagamentos/mensalidade/${id}`).then(r => r.data),
  create: (data: { id_mensalidade: number; valor_pago: number; forma_pagamento: string }) => api.post<PagamentoInterface>("/pagamentos", data).then(r => r.data),
  delete: (id: number) => api.delete(`/pagamentos/${id}`).then(r => r.status),
};
export const graduacaoService = {
  getByAluno: (id: number) => api.get<GraduacaoInterface[]>(`/graduacoes/aluno/${id}`).then(r => r.data),
  create: (data: { id_aluno: number; faixa: string; data_graduacao: string; observacao?: string }) => api.post<GraduacaoInterface>("/graduacoes", data).then(r => r.data),
  update: (id: number, data: Partial<GraduacaoInterface>) => api.put<GraduacaoInterface>(`/graduacoes/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/graduacoes/${id}`).then(r => r.status),
};
export const utilsService = {
  healthCheck: () => api.get("/healthcheck").then(r => r.data),
};

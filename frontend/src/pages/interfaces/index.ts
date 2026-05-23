export interface UsuarioInterface {
  id_usuario?: number;
  email: string;
  perfil: "admin" | "professor" | "aluno";
}
export interface AuthResponse {
  auth: boolean;
  token: string;
  usuario: UsuarioInterface;
}
export interface ModalidadeInterface {
  id_modalidade?: number;
  nome: string;
  descricao?: string;
}
export interface ProfessorInterface {
  id_professor?: number;
  nome: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  usuario?: UsuarioInterface;
}
export interface AlunoInterface {
  id_aluno?: number;
  nome: string;
  telefone?: string;
  email?: string;
  data_nascimento?: string;
  data_cadastro?: string;
  status: "ativo" | "inativo";
  usuario?: UsuarioInterface;
}
export interface TurmaInterface {
  id_turma?: number;
  nome: string;
  horario: string;
  dia_semana: string;
  modalidade: ModalidadeInterface;
  professor: ProfessorInterface;
  alunos?: AlunoInterface[];
}
export interface PresencaInterface {
  id_presenca?: number;
  data: string;
  presente: boolean;
  aluno: AlunoInterface;
  turma: TurmaInterface;
}
export interface MensalidadeInterface {
  id_mensalidade?: number;
  mes_referencia: string;
  valor: number;
  data_vencimento: string;
  status: "pendente" | "pago" | "atrasado";
  aluno: AlunoInterface;
  pagamentos?: PagamentoInterface[];
}
export interface PagamentoInterface {
  id_pagamento?: number;
  data_pagamento?: string;
  valor_pago: number;
  forma_pagamento: string;
  mensalidade: MensalidadeInterface;
}
export interface GraduacaoInterface {
  id_graduacao?: number;
  faixa: string;
  data_graduacao: string;
  observacao?: string;
  aluno: AlunoInterface;
}

import express from "express";
import { LoginController } from "../controllers/loginController";
import { UsuarioController } from "../controllers/usuarioController";
import { AlunoController } from "../controllers/alunoController";
import { ProfessorController } from "../controllers/professorController";
import { ModalidadeController } from "../controllers/modalidadeController";
import { TurmaController } from "../controllers/turmaController";
import { PresencaController } from "../controllers/presencaController";
import { MensalidadeController } from "../controllers/mensalidadeController";
import { PagamentoController } from "../controllers/pagamentoController";
import { GraduacaoController } from "../controllers/graduacaoController";
import { UtilsController } from "../controllers/utilsController";
import auth from "../middleware/auth";

const router = express.Router();

const loginController     = new LoginController();
const usuarioController   = new UsuarioController();
const alunoController     = new AlunoController();
const professorController = new ProfessorController();
const modalidadeController= new ModalidadeController();
const turmaController     = new TurmaController();
const presencaController  = new PresencaController();
const mensalidadeController = new MensalidadeController();
const pagamentoController = new PagamentoController();
const graduacaoController = new GraduacaoController();
const utilsController     = new UtilsController();

// ── Utils ─────────────────────────────────────────────────────────────────────
router.get("/healthcheck", utilsController.healthCheck);

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/login", loginController.doLogin);

// ── Usuários ──────────────────────────────────────────────────────────────────
router.post  ("/usuarios",     auth.hasAuthorization, auth.isAdmin, usuarioController.create);
router.get   ("/usuarios",     auth.hasAuthorization, auth.isAdmin, usuarioController.getAll);
router.get   ("/usuarios/:id", auth.hasAuthorization, auth.isAdmin, usuarioController.getById);
router.put   ("/usuarios/:id", auth.hasAuthorization, auth.isAdmin, usuarioController.update);
router.delete("/usuarios/:id", auth.hasAuthorization, auth.isAdmin, usuarioController.delete);

// ── Alunos ────────────────────────────────────────────────────────────────────
router.post  ("/alunos",     auth.hasAuthorization, alunoController.create);
router.get   ("/alunos",     auth.hasAuthorization, alunoController.getAll);
router.get   ("/alunos/:id", auth.hasAuthorization, alunoController.getById);
router.put   ("/alunos/:id", auth.hasAuthorization, alunoController.update);
router.delete("/alunos/:id", auth.hasAuthorization, auth.isAdmin, alunoController.delete);

// ── Professores ───────────────────────────────────────────────────────────────
router.post  ("/professores",     auth.hasAuthorization, auth.isAdmin, professorController.create);
router.get   ("/professores",     auth.hasAuthorization, professorController.getAll);
router.get   ("/professores/:id", auth.hasAuthorization, professorController.getById);
router.put   ("/professores/:id", auth.hasAuthorization, auth.isAdmin, professorController.update);
router.delete("/professores/:id", auth.hasAuthorization, auth.isAdmin, professorController.delete);

// ── Modalidades ───────────────────────────────────────────────────────────────
router.post  ("/modalidades",     auth.hasAuthorization, auth.isAdmin, modalidadeController.create);
router.get   ("/modalidades",     auth.hasAuthorization, modalidadeController.getAll);
router.get   ("/modalidades/:id", auth.hasAuthorization, modalidadeController.getById);
router.put   ("/modalidades/:id", auth.hasAuthorization, auth.isAdmin, modalidadeController.update);
router.delete("/modalidades/:id", auth.hasAuthorization, auth.isAdmin, modalidadeController.delete);

// ── Turmas ────────────────────────────────────────────────────────────────────
router.post  ("/turmas",                auth.hasAuthorization, auth.isAdmin, turmaController.create);
router.get   ("/turmas",                auth.hasAuthorization, turmaController.getAll);
router.get   ("/turmas/:id",            auth.hasAuthorization, turmaController.getById);
router.put   ("/turmas/:id",            auth.hasAuthorization, auth.isAdmin, turmaController.update);
router.delete("/turmas/:id",            auth.hasAuthorization, auth.isAdmin, turmaController.delete);
router.post  ("/turmas/:id/matricular", auth.hasAuthorization, auth.isAdminOrProfessor, turmaController.matricularAluno);

// ── Presenças ─────────────────────────────────────────────────────────────────
router.post  ("/presencas",              auth.hasAuthorization, auth.isAdminOrProfessor, presencaController.create);
router.get   ("/presencas",              auth.hasAuthorization, presencaController.getAll);
router.get   ("/presencas/aluno/:id_aluno", auth.hasAuthorization, presencaController.getByAluno);
router.get   ("/presencas/turma/:id_turma", auth.hasAuthorization, presencaController.getByTurma);
router.put   ("/presencas/:id",          auth.hasAuthorization, auth.isAdminOrProfessor, presencaController.update);
router.delete("/presencas/:id",          auth.hasAuthorization, auth.isAdmin, presencaController.delete);

// ── Mensalidades ──────────────────────────────────────────────────────────────
router.post  ("/mensalidades",                    auth.hasAuthorization, auth.isAdmin, mensalidadeController.create);
router.get   ("/mensalidades",                    auth.hasAuthorization, auth.isAdmin, mensalidadeController.getAll);
router.get   ("/mensalidades/inadimplentes",      auth.hasAuthorization, auth.isAdmin, mensalidadeController.getInadimplentes);
router.get   ("/mensalidades/aluno/:id_aluno",    auth.hasAuthorization, mensalidadeController.getByAluno);
router.put   ("/mensalidades/:id",                auth.hasAuthorization, auth.isAdmin, mensalidadeController.update);
router.delete("/mensalidades/:id",                auth.hasAuthorization, auth.isAdmin, mensalidadeController.delete);

// ── Pagamentos ────────────────────────────────────────────────────────────────
router.post  ("/pagamentos",                           auth.hasAuthorization, auth.isAdmin, pagamentoController.create);
router.get   ("/pagamentos/mensalidade/:id_mensalidade", auth.hasAuthorization, auth.isAdmin, pagamentoController.getByMensalidade);
router.delete("/pagamentos/:id",                       auth.hasAuthorization, auth.isAdmin, pagamentoController.delete);

// ── Graduações ────────────────────────────────────────────────────────────────
router.post  ("/graduacoes",               auth.hasAuthorization, auth.isAdminOrProfessor, graduacaoController.create);
router.get   ("/graduacoes/aluno/:id_aluno", auth.hasAuthorization, graduacaoController.getByAluno);
router.put   ("/graduacoes/:id",           auth.hasAuthorization, auth.isAdminOrProfessor, graduacaoController.update);
router.delete("/graduacoes/:id",           auth.hasAuthorization, auth.isAdmin, graduacaoController.delete);

export default router;

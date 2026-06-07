import { Request, Response, NextFunction } from "express";
import { appDataSource } from "../data-source";
import { LogAuditoria } from "../entities/logAuditoria";

// Ações que devem ser registradas: método + trecho da rota
const ROTAS_MONITORADAS: { metodo: string; padrao: RegExp; acao: string; entidade: string }[] = [
  { metodo: "POST",   padrao: /^\/api\/login$/,                  acao: "LOGIN",              entidade: "usuario" },
  { metodo: "POST",   padrao: /^\/api\/usuarios$/,               acao: "CRIAR_USUARIO",      entidade: "usuario" },
  { metodo: "DELETE", padrao: /^\/api\/usuarios\/\d+$/,          acao: "DELETAR_USUARIO",    entidade: "usuario" },
  { metodo: "PATCH",  padrao: /^\/api\/usuarios\/\d+\/resetar-senha$/, acao: "RESETAR_SENHA", entidade: "usuario" },
  { metodo: "PATCH",  padrao: /^\/api\/minha-senha$/,            acao: "TROCAR_SENHA",       entidade: "usuario" },
  { metodo: "POST",   padrao: /^\/api\/alunos$/,                 acao: "CRIAR_ALUNO",        entidade: "aluno" },
  { metodo: "DELETE", padrao: /^\/api\/alunos\/\d+$/,            acao: "DELETAR_ALUNO",      entidade: "aluno" },
  { metodo: "PATCH",  padrao: /^\/api\/alunos\/\d+\/inativar$/,  acao: "INATIVAR_ALUNO",     entidade: "aluno" },
  { metodo: "POST",   padrao: /^\/api\/professores$/,            acao: "CRIAR_PROFESSOR",    entidade: "professor" },
  { metodo: "DELETE", padrao: /^\/api\/professores\/\d+$/,       acao: "DELETAR_PROFESSOR",  entidade: "professor" },
  { metodo: "POST",   padrao: /^\/api\/turmas$/,                 acao: "CRIAR_TURMA",        entidade: "turma" },
  { metodo: "DELETE", padrao: /^\/api\/turmas\/\d+$/,            acao: "DELETAR_TURMA",      entidade: "turma" },
  { metodo: "POST",   padrao: /^\/api\/turmas\/\d+\/matricular$/, acao: "MATRICULAR_ALUNO",  entidade: "matricula" },
  { metodo: "DELETE", padrao: /^\/api\/turmas\/\d+\/aluno\/\d+$/, acao: "DESMATRICULAR_ALUNO", entidade: "matricula" },
  { metodo: "POST",   padrao: /^\/api\/pagamentos$/,             acao: "REGISTRAR_PAGAMENTO", entidade: "pagamento" },
  { metodo: "POST",   padrao: /^\/api\/me\/pagamentos$/,         acao: "PAGAMENTO_ALUNO",    entidade: "pagamento" },
  { metodo: "POST",   padrao: /^\/api\/graduacoes$/,             acao: "REGISTRAR_GRADUACAO", entidade: "graduacao" },
  { metodo: "DELETE", padrao: /^\/api\/graduacoes\/\d+$/,        acao: "DELETAR_GRADUACAO",  entidade: "graduacao" },
  { metodo: "POST",   padrao: /^\/api\/mensalidades$/,           acao: "CRIAR_MENSALIDADE",  entidade: "mensalidade" },
  { metodo: "DELETE", padrao: /^\/api\/mensalidades\/\d+$/,      acao: "DELETAR_MENSALIDADE", entidade: "mensalidade" },
];

export function auditar(req: Request, res: Response, next: NextFunction) {
  const rota = req.originalUrl.split("?")[0];
  const metodo = req.method;

  const monitorada = ROTAS_MONITORADAS.find(
    r => r.metodo === metodo && r.padrao.test(rota)
  );

  if (!monitorada) {
    next();
    return;
  }

  // Captura a resposta para registrar o status
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    // Só registra se a operação foi bem-sucedida (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const usuario = (req as any).usuario;
      const idEntidade = extrairIdEntidade(rota, body);

      const log = new LogAuditoria();
      log.id_usuario = usuario?.id_usuario;
      log.email_usuario = usuario?.email || req.body?.email || "anônimo";
      log.acao = monitorada.acao;
      log.entidade = monitorada.entidade;
      log.id_entidade = idEntidade;
      log.detalhes = gerarDetalhes(monitorada.acao, req.body, body);
      log.ip = req.ip || req.socket.remoteAddress;

      // Salva de forma assíncrona sem bloquear a resposta
      if (appDataSource.isInitialized) {
        appDataSource.getRepository(LogAuditoria)
          .save(log)
          .catch(err => console.error("Erro ao salvar log de auditoria:", err));
      }
    }
    return originalJson(body);
  };

  next();
}

function extrairIdEntidade(rota: string, body: any): string {
  const match = rota.match(/\/(\d+)$/);
  if (match) return match[1];
  if (body?.id_usuario) return String(body.id_usuario);
  if (body?.id_aluno) return String(body.id_aluno);
  if (body?.id_professor) return String(body.id_professor);
  if (body?.id_pagamento) return String(body.id_pagamento);
  return "";
}

function gerarDetalhes(acao: string, reqBody: any, resBody: any): string {
  switch (acao) {
    case "LOGIN":
      return `Login realizado por ${reqBody?.email || "desconhecido"}`;
    case "CRIAR_USUARIO":
      return `Usuário criado: ${resBody?.usuario?.email} (perfil: ${resBody?.usuario?.perfil})`;
    case "DELETAR_USUARIO":
      return `Usuário removido`;
    case "RESETAR_SENHA":
      return `Senha resetada para padrão`;
    case "TROCAR_SENHA":
      return `Senha alterada pelo próprio usuário`;
    case "CRIAR_ALUNO":
      return `Aluno criado: ${reqBody?.nome}`;
    case "INATIVAR_ALUNO":
      return `Aluno inativado`;
    case "MATRICULAR_ALUNO":
      return `Aluno ${reqBody?.id_aluno} matriculado`;
    case "DESMATRICULAR_ALUNO":
      return `Aluno desmatriculado`;
    case "REGISTRAR_PAGAMENTO":
    case "PAGAMENTO_ALUNO":
      return `Pagamento de R$ ${reqBody?.valor_pago} via ${reqBody?.forma_pagamento}`;
    case "REGISTRAR_GRADUACAO":
      return `Graduação: ${reqBody?.faixa} para aluno ${reqBody?.id_aluno}`;
    case "CRIAR_MENSALIDADE":
      return `Mensalidade criada: ${reqBody?.mes_referencia} — R$ ${reqBody?.valor}`;
    default:
      return "";
  }
}

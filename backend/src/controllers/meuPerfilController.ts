import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import { Aluno } from "../entities/aluno";
import { Presenca } from "../entities/presenca";
import { Mensalidade } from "../entities/mensalidade";
import { Graduacao } from "../entities/graduacao";

export class MeuPerfilController {

  // Encontra o aluno vinculado ao usuário logado
  private async getAlunoDoUsuario(id_usuario: number): Promise<Aluno | null> {
    const alunoRepo = appDataSource.getRepository(Aluno);
    const aluno = await alunoRepo.findOne({
      where: { usuario: { id_usuario } },
      relations: ["usuario", "turmas", "turmas.modalidade", "turmas.professor"],
    });
    return aluno || null;
  }

  // GET /api/me/perfil — dados do próprio aluno
  getPerfil = async (req: Request, res: Response): Promise<void> => {
    try {
      const aluno = await this.getAlunoDoUsuario(req.usuario!.id_usuario);
      if (!aluno) {
        res.status(404).json({ error: "Perfil de aluno não encontrado para este usuário." });
        return;
      }
      res.status(200).json(aluno);
    } catch {
      res.status(500).json({ error: "Erro ao buscar perfil." });
    }
  };

  // GET /api/me/turmas — turmas em que o aluno está matriculado
  getMinhasTurmas = async (req: Request, res: Response): Promise<void> => {
    try {
      const aluno = await this.getAlunoDoUsuario(req.usuario!.id_usuario);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }
      res.status(200).json(aluno.turmas || []);
    } catch {
      res.status(500).json({ error: "Erro ao buscar turmas." });
    }
  };

  // GET /api/me/presencas — histórico de presença do próprio aluno
  getMinhasPresencas = async (req: Request, res: Response): Promise<void> => {
    try {
      const aluno = await this.getAlunoDoUsuario(req.usuario!.id_usuario);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }
      const presencaRepo = appDataSource.getRepository(Presenca);
      const presencas = await presencaRepo.find({
        where: { aluno: { id_aluno: aluno.id_aluno } },
        relations: ["turma", "turma.modalidade"],
        order: { data: "DESC" },
      });
      res.status(200).json(presencas);
    } catch {
      res.status(500).json({ error: "Erro ao buscar presenças." });
    }
  };

  // GET /api/me/mensalidades — mensalidades do próprio aluno
  getMinhasMensalidades = async (req: Request, res: Response): Promise<void> => {
    try {
      const aluno = await this.getAlunoDoUsuario(req.usuario!.id_usuario);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }
      const mensalidadeRepo = appDataSource.getRepository(Mensalidade);
      const mensalidades = await mensalidadeRepo.find({
        where: { aluno: { id_aluno: aluno.id_aluno } },
        relations: ["pagamentos"],
        order: { data_vencimento: "DESC" },
      });
      res.status(200).json(mensalidades);
    } catch {
      res.status(500).json({ error: "Erro ao buscar mensalidades." });
    }
  };

  // GET /api/me/graduacoes — histórico de faixas do próprio aluno
  getMinhasGraduacoes = async (req: Request, res: Response): Promise<void> => {
    try {
      const aluno = await this.getAlunoDoUsuario(req.usuario!.id_usuario);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }
      const graduacaoRepo = appDataSource.getRepository(Graduacao);
      const graduacoes = await graduacaoRepo.find({
        where: { aluno: { id_aluno: aluno.id_aluno } },
        order: { data_graduacao: "DESC" },
      });
      res.status(200).json(graduacoes);
    } catch {
      res.status(500).json({ error: "Erro ao buscar graduações." });
    }
  };
}

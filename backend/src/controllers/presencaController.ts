import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import PresencaRepository from "../repositories/presencaRepository";
import AlunoRepository from "../repositories/alunoRepository";
import TurmaRepository from "../repositories/turmaRepository";

export class PresencaController {
  private presencaRepository: PresencaRepository;
  private alunoRepository: AlunoRepository;
  private turmaRepository: TurmaRepository;

  constructor() {
    this.presencaRepository = new PresencaRepository(appDataSource);
    this.alunoRepository = new AlunoRepository(appDataSource);
    this.turmaRepository = new TurmaRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const presencas = await this.presencaRepository.getAll();
      res.status(200).json(presencas);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar presenças." });
    }
  };

  getByAluno = async (req: Request, res: Response): Promise<void> => {
    try {
      const presencas = await this.presencaRepository.getByAluno(
        parseInt(req.params.id_aluno)
      );
      res.status(200).json(presencas);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar presenças do aluno." });
    }
  };

  getByTurma = async (req: Request, res: Response): Promise<void> => {
    try {
      const presencas = await this.presencaRepository.getByTurma(
        parseInt(req.params.id_turma)
      );
      res.status(200).json(presencas);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar presenças da turma." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_aluno, id_turma, data, presente } = req.body;
      if (!id_aluno || !id_turma || !data) {
        res.status(400).json({ error: "Campos obrigatórios: id_aluno, id_turma, data." });
        return;
      }

      const aluno = await this.alunoRepository.getById(id_aluno);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }

      const turma = await this.turmaRepository.getById(id_turma);
      if (!turma) {
        res.status(404).json({ error: "Turma não encontrada." });
        return;
      }

      const nova = await this.presencaRepository.create({
        data,
        presente: presente ?? false,
        aluno,
        turma,
      });
      res.status(201).json(nova);
    } catch (error) {
      res.status(500).json({ error: "Erro ao registrar presença." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const atualizada = await this.presencaRepository.update(
        parseInt(req.params.id),
        req.body
      );
      if (!atualizada) {
        res.status(404).json({ error: "Presença não encontrada." });
        return;
      }
      res.status(200).json(atualizada);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar presença." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sucesso = await this.presencaRepository.delete(
        parseInt(req.params.id)
      );
      if (!sucesso) {
        res.status(404).json({ error: "Presença não encontrada." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar presença." });
    }
  };
}

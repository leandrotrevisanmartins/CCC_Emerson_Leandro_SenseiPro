import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import AlunoRepository from "../repositories/alunoRepository";

export class AlunoController {
  private alunoRepository: AlunoRepository;

  constructor() {
    this.alunoRepository = new AlunoRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const alunos = await this.alunoRepository.getAll();
      res.status(200).json(alunos);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar alunos." });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const aluno = await this.alunoRepository.getById(parseInt(req.params.id));
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }
      res.status(200).json(aluno);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar aluno." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome } = req.body;
      if (!nome) {
        res.status(400).json({ error: "O campo nome é obrigatório." });
        return;
      }
      const novoAluno = await this.alunoRepository.create(req.body);
      res.status(201).json(novoAluno);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar aluno." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const atualizado = await this.alunoRepository.update(
        parseInt(req.params.id),
        req.body
      );
      if (!atualizado) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }
      res.status(200).json(atualizado);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar aluno." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sucesso = await this.alunoRepository.delete(parseInt(req.params.id));
      if (!sucesso) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar aluno." });
    }
  };
}

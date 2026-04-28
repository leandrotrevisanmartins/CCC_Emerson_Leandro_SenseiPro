import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import GraduacaoRepository from "../repositories/graduacaoRepository";
import AlunoRepository from "../repositories/alunoRepository";

export class GraduacaoController {
  private graduacaoRepository: GraduacaoRepository;
  private alunoRepository: AlunoRepository;

  constructor() {
    this.graduacaoRepository = new GraduacaoRepository(appDataSource);
    this.alunoRepository = new AlunoRepository(appDataSource);
  }

  getByAluno = async (req: Request, res: Response): Promise<void> => {
    try {
      const graduacoes = await this.graduacaoRepository.getByAluno(
        parseInt(req.params.id_aluno)
      );
      res.status(200).json(graduacoes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar graduações." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_aluno, faixa, data_graduacao, observacao } = req.body;
      if (!id_aluno || !faixa || !data_graduacao) {
        res.status(400).json({
          error: "Campos obrigatórios: id_aluno, faixa, data_graduacao.",
        });
        return;
      }

      const aluno = await this.alunoRepository.getById(id_aluno);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }

      const nova = await this.graduacaoRepository.create({
        faixa,
        data_graduacao,
        observacao,
        aluno,
      });
      res.status(201).json(nova);
    } catch (error) {
      res.status(500).json({ error: "Erro ao registrar graduação." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const atualizada = await this.graduacaoRepository.update(
        parseInt(req.params.id),
        req.body
      );
      if (!atualizada) {
        res.status(404).json({ error: "Graduação não encontrada." });
        return;
      }
      res.status(200).json(atualizada);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar graduação." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sucesso = await this.graduacaoRepository.delete(
        parseInt(req.params.id)
      );
      if (!sucesso) {
        res.status(404).json({ error: "Graduação não encontrada." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar graduação." });
    }
  };
}

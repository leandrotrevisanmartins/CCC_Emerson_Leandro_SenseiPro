import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import MensalidadeRepository from "../repositories/mensalidadeRepository";
import AlunoRepository from "../repositories/alunoRepository";

export class MensalidadeController {
  private mensalidadeRepository: MensalidadeRepository;
  private alunoRepository: AlunoRepository;

  constructor() {
    this.mensalidadeRepository = new MensalidadeRepository(appDataSource);
    this.alunoRepository = new AlunoRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const mensalidades = await this.mensalidadeRepository.getAll();
      res.status(200).json(mensalidades);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar mensalidades." });
    }
  };

  getByAluno = async (req: Request, res: Response): Promise<void> => {
    try {
      const mensalidades = await this.mensalidadeRepository.getByAluno(
        parseInt(req.params.id_aluno)
      );
      res.status(200).json(mensalidades);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar mensalidades do aluno." });
    }
  };

  getInadimplentes = async (req: Request, res: Response): Promise<void> => {
    try {
      const inadimplentes = await this.mensalidadeRepository.getInadimplentes();
      res.status(200).json(inadimplentes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar inadimplentes." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_aluno, mes_referencia, valor, data_vencimento } = req.body;
      if (!id_aluno || !mes_referencia || !valor || !data_vencimento) {
        res.status(400).json({
          error: "Campos obrigatórios: id_aluno, mes_referencia, valor, data_vencimento.",
        });
        return;
      }

      const aluno = await this.alunoRepository.getById(id_aluno);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }

      const nova = await this.mensalidadeRepository.create({
        mes_referencia,
        valor,
        data_vencimento,
        aluno,
      });
      res.status(201).json(nova);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar mensalidade." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const atualizada = await this.mensalidadeRepository.update(
        parseInt(req.params.id),
        req.body
      );
      if (!atualizada) {
        res.status(404).json({ error: "Mensalidade não encontrada." });
        return;
      }
      res.status(200).json(atualizada);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar mensalidade." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sucesso = await this.mensalidadeRepository.delete(
        parseInt(req.params.id)
      );
      if (!sucesso) {
        res.status(404).json({ error: "Mensalidade não encontrada." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar mensalidade." });
    }
  };
}

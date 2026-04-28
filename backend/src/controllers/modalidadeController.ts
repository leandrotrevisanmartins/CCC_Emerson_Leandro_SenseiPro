import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import ModalidadeRepository from "../repositories/modalidadeRepository";

export class ModalidadeController {
  private modalidadeRepository: ModalidadeRepository;

  constructor() {
    this.modalidadeRepository = new ModalidadeRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const modalidades = await this.modalidadeRepository.getAll();
      res.status(200).json(modalidades);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar modalidades." });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const modalidade = await this.modalidadeRepository.getById(
        parseInt(req.params.id)
      );
      if (!modalidade) {
        res.status(404).json({ error: "Modalidade não encontrada." });
        return;
      }
      res.status(200).json(modalidade);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar modalidade." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome } = req.body;
      if (!nome) {
        res.status(400).json({ error: "O campo nome é obrigatório." });
        return;
      }
      const nova = await this.modalidadeRepository.create(req.body);
      res.status(201).json(nova);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar modalidade." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const atualizada = await this.modalidadeRepository.update(
        parseInt(req.params.id),
        req.body
      );
      if (!atualizada) {
        res.status(404).json({ error: "Modalidade não encontrada." });
        return;
      }
      res.status(200).json(atualizada);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar modalidade." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sucesso = await this.modalidadeRepository.delete(
        parseInt(req.params.id)
      );
      if (!sucesso) {
        res.status(404).json({ error: "Modalidade não encontrada." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar modalidade." });
    }
  };
}

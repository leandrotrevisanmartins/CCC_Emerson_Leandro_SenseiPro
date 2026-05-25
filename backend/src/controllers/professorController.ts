import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import ProfessorRepository from "../repositories/professorRepository";

export class ProfessorController {
  private professorRepository: ProfessorRepository;

  constructor() {
    this.professorRepository = new ProfessorRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const professores = await this.professorRepository.getAll();
      res.status(200).json(professores);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar professores." });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const professor = await this.professorRepository.getById(
        parseInt(req.params.id)
      );
      if (!professor) {
        res.status(404).json({ error: "Professor não encontrado." });
        return;
      }
      res.status(200).json(professor);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar professor." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome } = req.body;
      if (!nome) {
        res.status(400).json({ error: "O campo nome é obrigatório." });
        return;
      }
      const novoProfessor = await this.professorRepository.create(req.body);
      res.status(201).json(novoProfessor);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar professor." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const atualizado = await this.professorRepository.update(
        parseInt(req.params.id),
        req.body
      );
      if (!atualizado) {
        res.status(404).json({ error: "Professor não encontrado." });
        return;
      }
      res.status(200).json(atualizado);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar professor." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      // Verifica se o professor existe
      const professor = await this.professorRepository.getById(id);
      if (!professor) {
        res.status(404).json({ error: "Professor não encontrado." });
        return;
      }

      // Verifica vínculos com turmas
      const vinculos = await this.professorRepository.temVinculos(id);

      if (vinculos.turmas > 0) {
        res.status(409).json({
          error: "Não é possível excluir este professor pois ele está vinculado a turmas ativas.",
          detalhes: {
            turmas: vinculos.turmas,
          },
          sugestao: "Remova ou reatribua as turmas deste professor antes de excluí-lo.",
        });
        return;
      }

      const sucesso = await this.professorRepository.delete(id);
      if (!sucesso) {
        res.status(404).json({ error: "Professor não encontrado." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar professor." });
    }
  };
}

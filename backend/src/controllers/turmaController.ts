import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import TurmaRepository from "../repositories/turmaRepository";
import ModalidadeRepository from "../repositories/modalidadeRepository";
import ProfessorRepository from "../repositories/professorRepository";
import AlunoRepository from "../repositories/alunoRepository";

export class TurmaController {
  private turmaRepository: TurmaRepository;
  private modalidadeRepository: ModalidadeRepository;
  private professorRepository: ProfessorRepository;
  private alunoRepository: AlunoRepository;

  constructor() {
    this.turmaRepository = new TurmaRepository(appDataSource);
    this.modalidadeRepository = new ModalidadeRepository(appDataSource);
    this.professorRepository = new ProfessorRepository(appDataSource);
    this.alunoRepository = new AlunoRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const turmas = await this.turmaRepository.getAll();
      res.status(200).json(turmas);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar turmas." });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const turma = await this.turmaRepository.getById(parseInt(req.params.id));
      if (!turma) {
        res.status(404).json({ error: "Turma não encontrada." });
        return;
      }
      res.status(200).json(turma);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar turma." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome, horario, dia_semana, id_modalidade, id_professor } = req.body;
      if (!nome || !horario || !dia_semana || !id_modalidade || !id_professor) {
        res.status(400).json({
          error: "Campos obrigatórios: nome, horario, dia_semana, id_modalidade, id_professor.",
        });
        return;
      }

      const modalidade = await this.modalidadeRepository.getById(id_modalidade);
      if (!modalidade) {
        res.status(404).json({ error: "Modalidade não encontrada." });
        return;
      }

      const professor = await this.professorRepository.getById(id_professor);
      if (!professor) {
        res.status(404).json({ error: "Professor não encontrado." });
        return;
      }

      const nova = await this.turmaRepository.create({
        nome,
        horario,
        dia_semana,
        modalidade,
        professor,
      });
      res.status(201).json(nova);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar turma." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const atualizada = await this.turmaRepository.update(
        parseInt(req.params.id),
        req.body
      );
      if (!atualizada) {
        res.status(404).json({ error: "Turma não encontrada." });
        return;
      }
      res.status(200).json(atualizada);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar turma." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sucesso = await this.turmaRepository.delete(parseInt(req.params.id));
      if (!sucesso) {
        res.status(404).json({ error: "Turma não encontrada." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar turma." });
    }
  };

  // Matricular aluno em turma
  matricularAluno = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_aluno } = req.body;
      const id_turma = parseInt(req.params.id);

      const turma = await this.turmaRepository.getById(id_turma);
      if (!turma) {
        res.status(404).json({ error: "Turma não encontrada." });
        return;
      }

      const aluno = await this.alunoRepository.getById(id_aluno);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }

      const alunosAtuais = (await turma.alunos) || [];
      const jaMatriculado = alunosAtuais.some((a) => a.id_aluno === id_aluno);
      if (jaMatriculado) {
        res.status(409).json({ error: "Aluno já matriculado nesta turma." });
        return;
      }

      turma.alunos = [...alunosAtuais, aluno];
      await this.turmaRepository.update(id_turma, turma);
      res.status(200).json({ message: "Aluno matriculado com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao matricular aluno." });
    }
  };
}

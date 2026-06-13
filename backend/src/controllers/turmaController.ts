import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import TurmaRepository from "../repositories/turmaRepository";
import ModalidadeRepository from "../repositories/modalidadeRepository";
import ProfessorRepository from "../repositories/professorRepository";
import AlunoRepository from "../repositories/alunoRepository";
import { Turma } from "../entities/turma";
import { Aluno } from "../entities/aluno";
import { Presenca } from "../entities/presenca";

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
      if (!modalidade) { res.status(404).json({ error: "Modalidade não encontrada." }); return; }

      const professor = await this.professorRepository.getById(id_professor);
      if (!professor) { res.status(404).json({ error: "Professor não encontrado." }); return; }

      const nova = await this.turmaRepository.create({ nome, horario, dia_semana, modalidade, professor });
      res.status(201).json(nova);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar turma." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const atualizada = await this.turmaRepository.update(parseInt(req.params.id), req.body);
      if (!atualizada) { res.status(404).json({ error: "Turma não encontrada." }); return; }
      res.status(200).json(atualizada);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar turma." });
    }
  };

  // Verifica vínculos antes de deletar para evitar FK violation
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const turma = await this.turmaRepository.getById(id);
      if (!turma) {
        res.status(404).json({ error: "Turma não encontrada." });
        return;
      }

      // Conta alunos matriculados e presenças
      const presencaRepo = appDataSource.getRepository(Presenca);
      const [totalAlunos, totalPresencas] = await Promise.all([
        (turma.alunos || []).length,
        presencaRepo.count({ where: { turma: { id_turma: id } } }),
      ]);

      if (totalAlunos > 0 || totalPresencas > 0) {
        res.status(409).json({
          error: "Não é possível excluir esta turma pois ela possui registros vinculados.",
          detalhes: {
            alunos_matriculados: totalAlunos,
            presencas: totalPresencas,
          },
          sugestao: totalAlunos > 0
            ? "Desmatricule todos os alunos antes de excluir a turma."
            : "Remova os registros de presença antes de excluir a turma.",
        });
        return;
      }

      const sucesso = await this.turmaRepository.delete(id);
      if (!sucesso) {
        res.status(404).json({ error: "Turma não encontrada." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao deletar turma." });
    }
  };

  matricularAluno = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_aluno } = req.body;
      const id_turma = parseInt(req.params.id);

      const turmaRepo = appDataSource.getRepository(Turma);
      const alunoRepo = appDataSource.getRepository(Aluno);

      const turma = await turmaRepo.findOne({
        where: { id_turma },
        relations: ["alunos"],
      });
      if (!turma) { res.status(404).json({ error: "Turma não encontrada." }); return; }

      const aluno = await alunoRepo.findOne({ where: { id_aluno } });
      if (!aluno) { res.status(404).json({ error: "Aluno não encontrado." }); return; }

      const jaMatriculado = (turma.alunos || []).some(a => a.id_aluno === id_aluno);
      if (jaMatriculado) {
        res.status(409).json({ error: "Aluno já matriculado nesta turma." });
        return;
      }

      await turmaRepo
        .createQueryBuilder()
        .relation(Turma, "alunos")
        .of(id_turma)
        .add(id_aluno);

      res.status(200).json({ message: "Aluno matriculado com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao matricular aluno." });
    }
  };

  desmatricularAluno = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_aluno = parseInt(req.params.id_aluno);
      const id_turma = parseInt(req.params.id);

      const turmaRepo = appDataSource.getRepository(Turma);

      const turma = await turmaRepo.findOne({
        where: { id_turma },
        relations: ["alunos"],
      });
      if (!turma) { res.status(404).json({ error: "Turma não encontrada." }); return; }

      const matriculado = (turma.alunos || []).some(a => a.id_aluno === id_aluno);
      if (!matriculado) {
        res.status(404).json({ error: "Aluno não está matriculado nesta turma." });
        return;
      }

      await turmaRepo
        .createQueryBuilder()
        .relation(Turma, "alunos")
        .of(id_turma)
        .remove(id_aluno);

      res.status(200).json({ message: "Aluno desmatriculado com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao desmatricular aluno." });
    }
  };
}

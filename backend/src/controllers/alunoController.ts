import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import AlunoRepository from "../repositories/alunoRepository";
import { Turma } from "../entities/turma";

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

  inativar = async (req: Request, res: Response): Promise<void> => {
    try {
      const inativado = await this.alunoRepository.inativar(parseInt(req.params.id));
      if (!inativado) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }
      res.status(200).json(inativado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao inativar aluno." });
    }
  };

  // Exclui o aluno removendo todos os vínculos na ordem correta
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      const aluno = await this.alunoRepository.getById(id);
      if (!aluno) {
        res.status(404).json({ error: "Aluno não encontrado." });
        return;
      }

      const presencaRepo    = appDataSource.getRepository("Presenca");
      const pagamentoRepo   = appDataSource.getRepository("Pagamento");
      const mensalidadeRepo = appDataSource.getRepository("Mensalidade");
      const graduacaoRepo   = appDataSource.getRepository("Graduacao");
      const turmaRepo       = appDataSource.getRepository(Turma);

      // 1. Desmatricula de todas as turmas
      const turmasDoAluno = await turmaRepo
        .createQueryBuilder("turma")
        .innerJoin("turma.alunos", "aluno", "aluno.id_aluno = :id", { id })
        .select("turma.id_turma")
        .getMany();

      if (turmasDoAluno.length > 0) {
        await turmaRepo
          .createQueryBuilder()
          .relation(Turma, "alunos")
          .of(turmasDoAluno)
          .remove(id);
      }

      // 2. Remove presenças
      await presencaRepo
        .createQueryBuilder()
        .delete()
        .where("fk_Aluno_id_aluno = :id", { id })
        .execute();

      // 3. Busca IDs das mensalidades do aluno
      const mensalidades = await mensalidadeRepo
        .createQueryBuilder("m")
        .select("m.id_mensalidade", "id")
        .where("m.fk_Aluno_id_aluno = :id", { id })
        .getRawMany();

      // 4. Remove pagamentos vinculados (se houver mensalidades)
      if (mensalidades.length > 0) {
        const ids = mensalidades.map((m: any) => m.id);
        await pagamentoRepo
          .createQueryBuilder()
          .delete()
          .where("fk_Mensalidade_id_mensalidade IN (:...ids)", { ids })
          .execute();
      }

      // 5. Remove mensalidades
      await mensalidadeRepo
        .createQueryBuilder()
        .delete()
        .where("fk_Aluno_id_aluno = :id", { id })
        .execute();

      // 6. Remove graduações
      await graduacaoRepo
        .createQueryBuilder()
        .delete()
        .where("fk_Aluno_id_aluno = :id", { id })
        .execute();

      // 7. Remove o aluno
      await this.alunoRepository.delete(id);

      res.status(204).send();
    } catch (error) {
      console.error("ERRO DELETE ALUNO:", error);
      res.status(500).json({ error: "Erro ao deletar aluno." });
    }
  };
}

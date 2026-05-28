import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import { Aluno } from "../entities/aluno";
import { Presenca } from "../entities/presenca";
import { Mensalidade, StatusMensalidade } from "../entities/mensalidade";
import { Pagamento } from "../entities/pagamento";
import { Graduacao } from "../entities/graduacao";
import { Turma } from "../entities/turma";
import { Professor } from "../entities/professor";

export class MeuPerfilController {

  private async getAlunoDoUsuario(id_usuario: number): Promise<Aluno | null> {
    const repo = appDataSource.getRepository(Aluno);
    return await repo.findOne({
      where: { usuario: { id_usuario } },
      relations: ["usuario"],
    }) || null;
  }

  private async getProfessorDoUsuario(id_usuario: number): Promise<Professor | null> {
    const repo = appDataSource.getRepository(Professor);
    return await repo.findOne({
      where: { usuario: { id_usuario } },
      relations: ["usuario"],
    }) || null;
  }

  // GET /api/me/perfil
  getPerfil = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_usuario, perfil } = req.usuario!;
      if (perfil === "aluno") {
        const aluno = await this.getAlunoDoUsuario(id_usuario);
        if (!aluno) { res.status(404).json({ error: "Perfil de aluno não encontrado." }); return; }
        res.status(200).json({ perfil: "aluno", dados: aluno });
      } else if (perfil === "professor") {
        const professor = await this.getProfessorDoUsuario(id_usuario);
        if (!professor) { res.status(404).json({ error: "Perfil de professor não encontrado." }); return; }
        res.status(200).json({ perfil: "professor", dados: professor });
      } else {
        res.status(200).json({ perfil: "admin", dados: { email: req.usuario!.email } });
      }
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar perfil." });
    }
  };

  // GET /api/me/turmas
  getMinhasTurmas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_usuario, perfil } = req.usuario!;
      const turmaRepo = appDataSource.getRepository(Turma);

      if (perfil === "aluno") {
        const aluno = await this.getAlunoDoUsuario(id_usuario);
        if (!aluno) { res.status(200).json([]); return; }
        const turmas = await turmaRepo
          .createQueryBuilder("turma")
          .innerJoin("turma.alunos", "aluno", "aluno.id_aluno = :id", { id: aluno.id_aluno })
          .leftJoinAndSelect("turma.modalidade", "modalidade")
          .leftJoinAndSelect("turma.professor", "professor")
          .getMany();
        res.status(200).json(turmas);
      } else if (perfil === "professor") {
        const professor = await this.getProfessorDoUsuario(id_usuario);
        if (!professor) { res.status(200).json([]); return; }
        const turmas = await turmaRepo.find({
          where: { professor: { id_professor: professor.id_professor } },
          relations: ["modalidade", "professor", "alunos"],
        });
        res.status(200).json(turmas);
      } else {
        const turmas = await turmaRepo.find({
          relations: ["modalidade", "professor", "alunos"],
        });
        res.status(200).json(turmas);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar turmas." });
    }
  };

  // GET /api/me/presencas
  getMinhasPresencas = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_usuario, perfil } = req.usuario!;
      const repo = appDataSource.getRepository(Presenca);

      if (perfil === "aluno") {
        const aluno = await this.getAlunoDoUsuario(id_usuario);
        if (!aluno) { res.status(404).json({ error: "Aluno não encontrado." }); return; }
        const presencas = await repo.find({
          where: { aluno: { id_aluno: aluno.id_aluno } },
          relations: ["turma", "turma.modalidade"],
          order: { data: "DESC" },
        });
        res.status(200).json(presencas);
      } else if (perfil === "professor") {
        const professor = await this.getProfessorDoUsuario(id_usuario);
        if (!professor) { res.status(404).json({ error: "Professor não encontrado." }); return; }
        const turmaRepo = appDataSource.getRepository(Turma);
        const turmas = await turmaRepo.find({
          where: { professor: { id_professor: professor.id_professor } },
          select: ["id_turma"],
        });
        const turmaIds = turmas.map(t => t.id_turma!);
        if (turmaIds.length === 0) { res.status(200).json([]); return; }
        const presencas = await repo
          .createQueryBuilder("presenca")
          .leftJoinAndSelect("presenca.aluno", "aluno")
          .leftJoinAndSelect("presenca.turma", "turma")
          .where("turma.id_turma IN (:...ids)", { ids: turmaIds })
          .orderBy("presenca.data", "DESC")
          .getMany();
        res.status(200).json(presencas);
      } else {
        res.status(200).json(await repo.find({ relations: ["aluno", "turma"] }));
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar presenças." });
    }
  };

  // GET /api/me/mensalidades
  getMinhasMensalidades = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_usuario, perfil } = req.usuario!;
      if (perfil !== "aluno") {
        res.status(403).json({ error: "Apenas alunos têm mensalidades." });
        return;
      }
      const aluno = await this.getAlunoDoUsuario(id_usuario);
      if (!aluno) { res.status(404).json({ error: "Aluno não encontrado." }); return; }
      const repo = appDataSource.getRepository(Mensalidade);
      const mensalidades = await repo.find({
        where: { aluno: { id_aluno: aluno.id_aluno } },
        relations: ["pagamentos"],
        order: { data_vencimento: "DESC" },
      });
      res.status(200).json(mensalidades);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar mensalidades." });
    }
  };

  // POST /api/me/pagamentos — aluno confirma pagamento da própria mensalidade
  registrarMeuPagamento = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_usuario } = req.usuario!;
      const { id_mensalidade, valor_pago, forma_pagamento } = req.body;

      if (!id_mensalidade || !valor_pago || !forma_pagamento) {
        res.status(400).json({
          error: "Campos obrigatórios: id_mensalidade, valor_pago, forma_pagamento.",
        });
        return;
      }

      // Verifica se a mensalidade pertence ao aluno logado
      const aluno = await this.getAlunoDoUsuario(id_usuario);
      if (!aluno) { res.status(404).json({ error: "Aluno não encontrado." }); return; }

      const mensalidadeRepo = appDataSource.getRepository(Mensalidade);
      const mensalidade = await mensalidadeRepo.findOne({
        where: {
          id_mensalidade,
          aluno: { id_aluno: aluno.id_aluno },
        },
      });

      if (!mensalidade) {
        res.status(404).json({ error: "Mensalidade não encontrada ou não pertence a este aluno." });
        return;
      }

      if (mensalidade.status === StatusMensalidade.PAGO) {
        res.status(409).json({ error: "Esta mensalidade já foi paga." });
        return;
      }

      // Usa insert direto via QueryBuilder para garantir a FK corretamente
      const pagamentoRepo = appDataSource.getRepository(Pagamento);
      await pagamentoRepo
        .createQueryBuilder()
        .insert()
        .into(Pagamento)
        .values({
          valor_pago: parseFloat(String(valor_pago)),
          forma_pagamento,
          mensalidade: { id_mensalidade: mensalidade.id_mensalidade },
        })
        .execute();

      // Atualiza status para PAGO
      mensalidade.status = StatusMensalidade.PAGO;
      await mensalidadeRepo.save(mensalidade);

      res.status(201).json({ message: "Pagamento registrado com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao registrar pagamento." });
    }
  };

  // GET /api/me/graduacoes
  getMinhasGraduacoes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_usuario, perfil } = req.usuario!;
      if (perfil !== "aluno") {
        res.status(403).json({ error: "Apenas alunos têm graduações próprias." });
        return;
      }
      const aluno = await this.getAlunoDoUsuario(id_usuario);
      if (!aluno) { res.status(404).json({ error: "Aluno não encontrado." }); return; }
      const repo = appDataSource.getRepository(Graduacao);
      const graduacoes = await repo.find({
        where: { aluno: { id_aluno: aluno.id_aluno } },
        order: { data_graduacao: "DESC" },
      });
      res.status(200).json(graduacoes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar graduações." });
    }
  };
}

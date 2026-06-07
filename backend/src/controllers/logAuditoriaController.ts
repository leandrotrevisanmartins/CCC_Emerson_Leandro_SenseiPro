import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import { LogAuditoria } from "../entities/logAuditoria";

export class LogAuditoriaController {

  getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const repo = appDataSource.getRepository(LogAuditoria);
      const limite = parseInt(req.query.limite as string) || 100;
      const pagina = parseInt(req.query.pagina as string) || 1;
      const acao = req.query.acao as string;
      const entidade = req.query.entidade as string;

      const qb = repo.createQueryBuilder("log")
        .orderBy("log.criado_em", "DESC")
        .take(limite)
        .skip((pagina - 1) * limite);

      if (acao) qb.andWhere("log.acao = :acao", { acao });
      if (entidade) qb.andWhere("log.entidade = :entidade", { entidade });

      const [logs, total] = await qb.getManyAndCount();
      res.status(200).json({ logs, total, pagina, limite });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar logs." });
    }
  };
}

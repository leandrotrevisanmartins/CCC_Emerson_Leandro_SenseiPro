import { Request, Response } from "express";
import { appDataSource } from "../data-source";
import PagamentoRepository from "../repositories/pagamentoRepository";
import MensalidadeRepository from "../repositories/mensalidadeRepository";
import { StatusMensalidade } from "../entities/mensalidade";

export class PagamentoController {
  private pagamentoRepository: PagamentoRepository;
  private mensalidadeRepository: MensalidadeRepository;

  constructor() {
    this.pagamentoRepository = new PagamentoRepository(appDataSource);
    this.mensalidadeRepository = new MensalidadeRepository(appDataSource);
  }

  getByMensalidade = async (req: Request, res: Response): Promise<void> => {
    try {
      const pagamentos = await this.pagamentoRepository.getByMensalidade(
        parseInt(req.params.id_mensalidade)
      );
      res.status(200).json(pagamentos);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar pagamentos." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id_mensalidade, valor_pago, forma_pagamento } = req.body;
      if (!id_mensalidade || !valor_pago || !forma_pagamento) {
        res.status(400).json({
          error: "Campos obrigatórios: id_mensalidade, valor_pago, forma_pagamento.",
        });
        return;
      }

      const mensalidade = await this.mensalidadeRepository.getById(id_mensalidade);
      if (!mensalidade) {
        res.status(404).json({ error: "Mensalidade não encontrada." });
        return;
      }

      const novo = await this.pagamentoRepository.create({
        valor_pago,
        forma_pagamento,
        mensalidade,
      });

      // Atualiza status da mensalidade para PAGO automaticamente
      await this.mensalidadeRepository.update(id_mensalidade, {
        status: StatusMensalidade.PAGO,
      });

      res.status(201).json(novo);
    } catch (error) {
      res.status(500).json({ error: "Erro ao registrar pagamento." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sucesso = await this.pagamentoRepository.delete(
        parseInt(req.params.id)
      );
      if (!sucesso) {
        res.status(404).json({ error: "Pagamento não encontrado." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar pagamento." });
    }
  };
}

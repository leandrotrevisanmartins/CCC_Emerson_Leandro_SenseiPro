import { DataSource, Repository } from "typeorm";
import { Pagamento } from "../entities/pagamento";

export interface IPagamentoRepository {
  getAll(): Promise<Pagamento[]>;
  getById(id: number): Promise<Pagamento | undefined>;
  getByMensalidade(id_mensalidade: number): Promise<Pagamento[]>;
  create(data: Partial<Pagamento>): Promise<Pagamento>;
  delete(id: number): Promise<boolean>;
}

class PagamentoRepository implements IPagamentoRepository {
  private repository: Repository<Pagamento>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Pagamento);
  }

  async getAll(): Promise<Pagamento[]> {
    return this.repository.find({ relations: ["mensalidade"] });
  }

  async getById(id: number): Promise<Pagamento | undefined> {
    const pagamento = await this.repository.findOne({
      where: { id_pagamento: id },
      relations: ["mensalidade"],
    });
    return pagamento || undefined;
  }

  async getByMensalidade(id_mensalidade: number): Promise<Pagamento[]> {
    return this.repository.find({
      where: { mensalidade: { id_mensalidade } },
      relations: ["mensalidade"],
    });
  }

  async create(data: Partial<Pagamento>): Promise<Pagamento> {
    const novo = this.repository.create(data);
    return this.repository.save(novo);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default PagamentoRepository;

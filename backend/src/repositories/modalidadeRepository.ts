import { DataSource, Repository } from "typeorm";
import { Modalidade } from "../entities/modalidade";

export interface IModalidadeRepository {
  getAll(): Promise<Modalidade[]>;
  getById(id: number): Promise<Modalidade | undefined>;
  create(data: Partial<Modalidade>): Promise<Modalidade>;
  update(id: number, data: Partial<Modalidade>): Promise<Modalidade | undefined>;
  delete(id: number): Promise<boolean>;
}

class ModalidadeRepository implements IModalidadeRepository {
  private repository: Repository<Modalidade>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Modalidade);
  }

  async getAll(): Promise<Modalidade[]> {
    return this.repository.find();
  }

  async getById(id: number): Promise<Modalidade | undefined> {
    const modalidade = await this.repository.findOneBy({ id_modalidade: id });
    return modalidade || undefined;
  }

  async create(data: Partial<Modalidade>): Promise<Modalidade> {
    const nova = this.repository.create(data);
    return this.repository.save(nova);
  }

  async update(id: number, data: Partial<Modalidade>): Promise<Modalidade | undefined> {
    const modalidade = await this.getById(id);
    if (!modalidade) return undefined;
    const merged = this.repository.merge(modalidade, data);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default ModalidadeRepository;

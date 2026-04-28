import { DataSource, Repository } from "typeorm";
import { Aluno } from "../entities/aluno";

export interface IAlunoRepository {
  getAll(): Promise<Aluno[]>;
  getById(id: number): Promise<Aluno | undefined>;
  create(data: Partial<Aluno>): Promise<Aluno>;
  update(id: number, data: Partial<Aluno>): Promise<Aluno | undefined>;
  delete(id: number): Promise<boolean>;
}

class AlunoRepository implements IAlunoRepository {
  private repository: Repository<Aluno>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Aluno);
  }

  async getAll(): Promise<Aluno[]> {
    return this.repository.find({ relations: ["usuario", "turmas"] });
  }

  async getById(id: number): Promise<Aluno | undefined> {
    const aluno = await this.repository.findOne({
      where: { id_aluno: id },
      relations: ["usuario", "turmas", "graduacoes"],
    });
    return aluno || undefined;
  }

  async create(data: Partial<Aluno>): Promise<Aluno> {
    const novo = this.repository.create(data);
    return this.repository.save(novo);
  }

  async update(id: number, data: Partial<Aluno>): Promise<Aluno | undefined> {
    const aluno = await this.getById(id);
    if (!aluno) return undefined;
    const merged = this.repository.merge(aluno, data);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default AlunoRepository;

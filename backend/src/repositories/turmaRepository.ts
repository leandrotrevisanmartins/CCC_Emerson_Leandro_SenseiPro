import { DataSource, Repository } from "typeorm";
import { Turma } from "../entities/turma";

export interface ITurmaRepository {
  getAll(): Promise<Turma[]>;
  getById(id: number): Promise<Turma | undefined>;
  create(data: Partial<Turma>): Promise<Turma>;
  update(id: number, data: Partial<Turma>): Promise<Turma | undefined>;
  delete(id: number): Promise<boolean>;
}

class TurmaRepository implements ITurmaRepository {
  private repository: Repository<Turma>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Turma);
  }

  async getAll(): Promise<Turma[]> {
    return this.repository.find({
      relations: ["modalidade", "professor", "alunos"],
    });
  }

  async getById(id: number): Promise<Turma | undefined> {
    const turma = await this.repository.findOne({
      where: { id_turma: id },
      relations: ["modalidade", "professor", "alunos"],
    });
    return turma || undefined;
  }

  async create(data: Partial<Turma>): Promise<Turma> {
    const nova = this.repository.create(data);
    return this.repository.save(nova);
  }

  async update(id: number, data: Partial<Turma>): Promise<Turma | undefined> {
    const turma = await this.getById(id);
    if (!turma) return undefined;
    const merged = this.repository.merge(turma, data);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default TurmaRepository;

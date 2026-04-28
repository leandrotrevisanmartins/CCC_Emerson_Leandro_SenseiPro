import { DataSource, Repository } from "typeorm";
import { Presenca } from "../entities/presenca";

export interface IPresencaRepository {
  getAll(): Promise<Presenca[]>;
  getById(id: number): Promise<Presenca | undefined>;
  getByAluno(id_aluno: number): Promise<Presenca[]>;
  getByTurma(id_turma: number): Promise<Presenca[]>;
  create(data: Partial<Presenca>): Promise<Presenca>;
  update(id: number, data: Partial<Presenca>): Promise<Presenca | undefined>;
  delete(id: number): Promise<boolean>;
}

class PresencaRepository implements IPresencaRepository {
  private repository: Repository<Presenca>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Presenca);
  }

  async getAll(): Promise<Presenca[]> {
    return this.repository.find({ relations: ["aluno", "turma"] });
  }

  async getById(id: number): Promise<Presenca | undefined> {
    const presenca = await this.repository.findOne({
      where: { id_presenca: id },
      relations: ["aluno", "turma"],
    });
    return presenca || undefined;
  }

  async getByAluno(id_aluno: number): Promise<Presenca[]> {
    return this.repository.find({
      where: { aluno: { id_aluno } },
      relations: ["aluno", "turma"],
    });
  }

  async getByTurma(id_turma: number): Promise<Presenca[]> {
    return this.repository.find({
      where: { turma: { id_turma } },
      relations: ["aluno", "turma"],
    });
  }

  async create(data: Partial<Presenca>): Promise<Presenca> {
    const nova = this.repository.create(data);
    return this.repository.save(nova);
  }

  async update(id: number, data: Partial<Presenca>): Promise<Presenca | undefined> {
    const presenca = await this.getById(id);
    if (!presenca) return undefined;
    const merged = this.repository.merge(presenca, data);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default PresencaRepository;

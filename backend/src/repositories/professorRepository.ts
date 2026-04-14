import { DataSource, Repository } from "typeorm";
import { Professor } from "../entities/professor";

export interface IProfessorRepository {
  getAll(): Promise<Professor[]>;
  getById(id: number): Promise<Professor | undefined>;
  create(data: Partial<Professor>): Promise<Professor>;
  update(id: number, data: Partial<Professor>): Promise<Professor | undefined>;
  delete(id: number): Promise<boolean>;
}

class ProfessorRepository implements IProfessorRepository {
  private repository: Repository<Professor>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Professor);
  }

  async getAll(): Promise<Professor[]> {
    return this.repository.find({ relations: ["usuario"] });
  }

  async getById(id: number): Promise<Professor | undefined> {
    const professor = await this.repository.findOne({
      where: { id_professor: id },
      relations: ["usuario", "turmas"],
    });
    return professor || undefined;
  }

  async create(data: Partial<Professor>): Promise<Professor> {
    const novo = this.repository.create(data);
    return this.repository.save(novo);
  }

  async update(id: number, data: Partial<Professor>): Promise<Professor | undefined> {
    const professor = await this.getById(id);
    if (!professor) return undefined;
    const merged = this.repository.merge(professor, data);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default ProfessorRepository;

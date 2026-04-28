import { DataSource, Repository } from "typeorm";
import { Graduacao } from "../entities/graduacao";

export interface IGraduacaoRepository {
  getAll(): Promise<Graduacao[]>;
  getById(id: number): Promise<Graduacao | undefined>;
  getByAluno(id_aluno: number): Promise<Graduacao[]>;
  create(data: Partial<Graduacao>): Promise<Graduacao>;
  update(id: number, data: Partial<Graduacao>): Promise<Graduacao | undefined>;
  delete(id: number): Promise<boolean>;
}

class GraduacaoRepository implements IGraduacaoRepository {
  private repository: Repository<Graduacao>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Graduacao);
  }

  async getAll(): Promise<Graduacao[]> {
    return this.repository.find({ relations: ["aluno"] });
  }

  async getById(id: number): Promise<Graduacao | undefined> {
    const graduacao = await this.repository.findOne({
      where: { id_graduacao: id },
      relations: ["aluno"],
    });
    return graduacao || undefined;
  }

  async getByAluno(id_aluno: number): Promise<Graduacao[]> {
    return this.repository.find({
      where: { aluno: { id_aluno } },
      relations: ["aluno"],
      order: { data_graduacao: "DESC" },
    });
  }

  async create(data: Partial<Graduacao>): Promise<Graduacao> {
    const nova = this.repository.create(data);
    return this.repository.save(nova);
  }

  async update(id: number, data: Partial<Graduacao>): Promise<Graduacao | undefined> {
    const graduacao = await this.getById(id);
    if (!graduacao) return undefined;
    const merged = this.repository.merge(graduacao, data);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default GraduacaoRepository;

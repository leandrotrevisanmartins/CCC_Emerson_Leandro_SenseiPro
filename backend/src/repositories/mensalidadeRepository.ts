import { DataSource, Repository } from "typeorm";
import { Mensalidade, StatusMensalidade } from "../entities/mensalidade";

export interface IMensalidadeRepository {
  getAll(): Promise<Mensalidade[]>;
  getById(id: number): Promise<Mensalidade | undefined>;
  getByAluno(id_aluno: number): Promise<Mensalidade[]>;
  getInadimplentes(): Promise<Mensalidade[]>;
  create(data: Partial<Mensalidade>): Promise<Mensalidade>;
  update(id: number, data: Partial<Mensalidade>): Promise<Mensalidade | undefined>;
  delete(id: number): Promise<boolean>;
}

class MensalidadeRepository implements IMensalidadeRepository {
  private repository: Repository<Mensalidade>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Mensalidade);
  }

  async getAll(): Promise<Mensalidade[]> {
    return this.repository.find({ relations: ["aluno"] });
  }

  async getById(id: number): Promise<Mensalidade | undefined> {
    const mensalidade = await this.repository.findOne({
      where: { id_mensalidade: id },
      relations: ["aluno", "pagamentos"],
    });
    return mensalidade || undefined;
  }

  async getByAluno(id_aluno: number): Promise<Mensalidade[]> {
    return this.repository.find({
      where: { aluno: { id_aluno } },
      relations: ["aluno", "pagamentos"],
    });
  }

  async getInadimplentes(): Promise<Mensalidade[]> {
    return this.repository.find({
      where: { status: StatusMensalidade.ATRASADO },
      relations: ["aluno"],
    });
  }

  async create(data: Partial<Mensalidade>): Promise<Mensalidade> {
    const nova = this.repository.create(data);
    return this.repository.save(nova);
  }

  async update(id: number, data: Partial<Mensalidade>): Promise<Mensalidade | undefined> {
    const mensalidade = await this.getById(id);
    if (!mensalidade) return undefined;
    const merged = this.repository.merge(mensalidade, data);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default MensalidadeRepository;

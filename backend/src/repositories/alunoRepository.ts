import { DataSource, Repository } from "typeorm";
import { Aluno, StatusAluno } from "../entities/aluno";
import { Presenca } from "../entities/presenca";
import { Mensalidade } from "../entities/mensalidade";

export interface IAlunoRepository {
  getAll(): Promise<Aluno[]>;
  getById(id: number): Promise<Aluno | undefined>;
  create(data: Partial<Aluno>): Promise<Aluno>;
  update(id: number, data: Partial<Aluno>): Promise<Aluno | undefined>;
  inativar(id: number): Promise<Aluno | undefined>;
  delete(id: number): Promise<boolean>;
  temVinculos(id: number): Promise<{ presencas: number; mensalidades: number }>;
}

class AlunoRepository implements IAlunoRepository {
  private repository: Repository<Aluno>;
  private presencaRepository: Repository<Presenca>;
  private mensalidadeRepository: Repository<Mensalidade>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Aluno);
    this.presencaRepository = dataSource.getRepository(Presenca);
    this.mensalidadeRepository = dataSource.getRepository(Mensalidade);
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

  // Inativa o aluno sem excluir — usado quando há vínculos
  async inativar(id: number): Promise<Aluno | undefined> {
    const aluno = await this.getById(id);
    if (!aluno) return undefined;
    aluno.status = StatusAluno.INATIVO;
    return this.repository.save(aluno);
  }

  // Verifica quantos registros estão vinculados ao aluno
  async temVinculos(id: number): Promise<{ presencas: number; mensalidades: number }> {
    const [presencas, mensalidades] = await Promise.all([
      this.presencaRepository.count({ where: { aluno: { id_aluno: id } } }),
      this.mensalidadeRepository.count({ where: { aluno: { id_aluno: id } } }),
    ]);
    return { presencas, mensalidades };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default AlunoRepository;

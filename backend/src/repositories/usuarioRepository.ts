import { DataSource, Repository } from "typeorm";
import { Usuario } from "../entities/usuario";

export interface IUsuarioRepository {
  getAll(): Promise<Usuario[]>;
  getById(id: number): Promise<Usuario | undefined>;
  getByEmail(email: string): Promise<Usuario | undefined>;
  create(data: Omit<Usuario, "id_usuario">): Promise<Usuario>;
  update(id: number, data: Partial<Usuario>): Promise<Usuario | undefined>;
  delete(id: number): Promise<boolean>;
}

class UsuarioRepository implements IUsuarioRepository {
  private repository: Repository<Usuario>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Usuario);
  }

  async getAll(): Promise<Usuario[]> {
    return this.repository.find();
  }

  async getById(id: number): Promise<Usuario | undefined> {
    const usuario = await this.repository.findOneBy({ id_usuario: id });
    return usuario || undefined;
  }

  async getByEmail(email: string): Promise<Usuario | undefined> {
    const usuario = await this.repository.findOneBy({ email });
    return usuario || undefined;
  }

  async create(data: Omit<Usuario, "id_usuario">): Promise<Usuario> {
    const novo = this.repository.create(data);
    return this.repository.save(novo);
  }

  async update(id: number, data: Partial<Usuario>): Promise<Usuario | undefined> {
    const usuario = await this.getById(id);
    if (!usuario) return undefined;
    const merged = this.repository.merge(usuario, data);
    return this.repository.save(merged); // corrigido: save após merge
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

export default UsuarioRepository;

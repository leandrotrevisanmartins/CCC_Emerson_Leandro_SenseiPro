import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";

export enum PerfilUsuario {
  ADMIN = "admin",
  PROFESSOR = "professor",
  ALUNO = "aluno",
}

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario?: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  senha!: string;

  @Column({
    type: "enum",
    enum: PerfilUsuario,
    default: PerfilUsuario.ALUNO,
  })
  perfil!: PerfilUsuario;

  constructor(
    id_usuario?: number,
    email?: string,
    senha?: string,
    perfil?: PerfilUsuario
  ) {
    if (id_usuario) this.id_usuario = id_usuario;
    if (email) this.email = email;
    if (senha) this.senha = senha;
    if (perfil) this.perfil = perfil;
  }
}

export default Usuario;

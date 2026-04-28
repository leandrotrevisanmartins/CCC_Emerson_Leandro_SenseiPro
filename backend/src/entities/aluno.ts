import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Usuario } from "./usuario";
import { Turma } from "./turma";
import { Presenca } from "./presenca";
import { Mensalidade } from "./mensalidade";
import { Graduacao } from "./graduacao";

export enum StatusAluno {
  ATIVO = "ativo",
  INATIVO = "inativo",
}

@Entity()
export class Aluno {
  @PrimaryGeneratedColumn()
  id_aluno?: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  telefone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: "date", nullable: true })
  data_nascimento?: Date;

  @CreateDateColumn()
  data_cadastro?: Date;

  @Column({
    type: "enum",
    enum: StatusAluno,
    default: StatusAluno.ATIVO,
  })
  status!: StatusAluno;

  @OneToOne(() => Usuario, { eager: false, nullable: true })
  @JoinColumn({ name: "fk_Usuario_id_usuario" })
  usuario?: Usuario;

  @ManyToMany(() => Turma, (turma) => turma.alunos, { lazy: true })
  turmas?: Turma[];

  @OneToMany(() => Presenca, (presenca) => presenca.aluno, { lazy: true })
  presencas?: Presenca[];

  @OneToMany(() => Mensalidade, (mensalidade) => mensalidade.aluno, {
    lazy: true,
  })
  mensalidades?: Mensalidade[];

  @OneToMany(() => Graduacao, (graduacao) => graduacao.aluno, { lazy: true })
  graduacoes?: Graduacao[];
}

export default Aluno;

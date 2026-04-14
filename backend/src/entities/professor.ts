import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Usuario } from "./usuario";
import { Turma } from "./turma";

@Entity()
export class Professor {
  @PrimaryGeneratedColumn()
  id_professor?: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  telefone?: string;

  @Column({ nullable: true })
  especialidade?: string;

  @OneToOne(() => Usuario, { eager: false, nullable: true })
  @JoinColumn({ name: "fk_Usuario_id_usuario" })
  usuario?: Usuario;

  @OneToMany(() => Turma, (turma) => turma.professor, { lazy: true })
  turmas?: Turma[];
}

export default Professor;

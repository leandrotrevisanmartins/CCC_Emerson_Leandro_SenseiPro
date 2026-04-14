import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Turma } from "./turma";

@Entity()
export class Modalidade {
  @PrimaryGeneratedColumn()
  id_modalidade?: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  descricao?: string;

  @OneToMany(() => Turma, (turma) => turma.modalidade, { lazy: true })
  turmas?: Turma[];
}

export default Modalidade;

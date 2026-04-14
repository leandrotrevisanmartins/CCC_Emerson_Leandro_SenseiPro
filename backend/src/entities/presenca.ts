import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Aluno } from "./aluno";
import { Turma } from "./turma";

@Entity()
export class Presenca {
  @PrimaryGeneratedColumn()
  id_presenca?: number;

  @Column({ type: "date" })
  data!: Date;

  @Column({ default: false })
  presente!: boolean;

  @ManyToOne(() => Aluno, (aluno) => aluno.presencas, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "fk_Aluno_id_aluno" })
  aluno!: Aluno;

  @ManyToOne(() => Turma, (turma) => turma.presencas, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "fk_Turma_id_turma" })
  turma!: Turma;
}

export default Presenca;

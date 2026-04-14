import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Aluno } from "./aluno";

@Entity()
export class Graduacao {
  @PrimaryGeneratedColumn()
  id_graduacao?: number;

  @Column()
  faixa!: string;

  @Column({ type: "date" })
  data_graduacao!: Date;

  @Column({ nullable: true })
  observacao?: string;

  @ManyToOne(() => Aluno, (aluno) => aluno.graduacoes, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "fk_Aluno_id_aluno" })
  aluno!: Aluno;
}

export default Graduacao;

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from "typeorm";
import { Modalidade } from "./modalidade";
import { Professor } from "./professor";
import { Aluno } from "./aluno";
import { Presenca } from "./presenca";

@Entity()
export class Turma {
  @PrimaryGeneratedColumn()
  id_turma?: number;

  @Column()
  nome!: string;

  @Column()
  horario!: string;

  @Column()
  dia_semana!: string;

  @ManyToOne(() => Modalidade, (modalidade) => modalidade.turmas, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "fk_Modalidade_id_modalidade" })
  modalidade!: Modalidade;

  @ManyToOne(() => Professor, (professor) => professor.turmas, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "fk_Professor_id_professor" })
  professor!: Professor;

  @ManyToMany(() => Aluno, (aluno) => aluno.turmas, { lazy: true })
  @JoinTable({
    name: "matricula",
    joinColumn: { name: "fk_Turma_id_turma", referencedColumnName: "id_turma" },
    inverseJoinColumn: { name: "fk_Aluno_id_aluno", referencedColumnName: "id_aluno" },
  })
  alunos?: Aluno[];

  @OneToMany(() => Presenca, (presenca) => presenca.turma, { lazy: true })
  presencas?: Presenca[];
}

export default Turma;

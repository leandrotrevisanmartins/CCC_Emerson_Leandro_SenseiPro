import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Aluno } from "./aluno";
import { Pagamento } from "./pagamento";

export enum StatusMensalidade {
  PENDENTE = "pendente",
  PAGO = "pago",
  ATRASADO = "atrasado",
}

@Entity()
export class Mensalidade {
  @PrimaryGeneratedColumn()
  id_mensalidade?: number;

  @Column()
  mes_referencia!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  valor!: number;

  @Column({ type: "date" })
  data_vencimento!: Date;

  @Column({
    type: "enum",
    enum: StatusMensalidade,
    default: StatusMensalidade.PENDENTE,
  })
  status!: StatusMensalidade;

  @ManyToOne(() => Aluno, (aluno) => aluno.mensalidades, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "fk_Aluno_id_aluno" })
  aluno!: Aluno;

  @OneToMany(() => Pagamento, (pagamento) => pagamento.mensalidade, {
    lazy: true,
  })
  pagamentos?: Pagamento[];
}

export default Mensalidade;

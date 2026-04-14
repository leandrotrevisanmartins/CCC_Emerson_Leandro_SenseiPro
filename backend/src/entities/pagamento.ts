import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Mensalidade } from "./mensalidade";

@Entity()
export class Pagamento {
  @PrimaryGeneratedColumn()
  id_pagamento?: number;

  @CreateDateColumn()
  data_pagamento?: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  valor_pago!: number;

  @Column()
  forma_pagamento!: string;

  @ManyToOne(() => Mensalidade, (mensalidade) => mensalidade.pagamentos, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "fk_Mensalidade_id_mensalidade" })
  mensalidade!: Mensalidade;
}

export default Pagamento;

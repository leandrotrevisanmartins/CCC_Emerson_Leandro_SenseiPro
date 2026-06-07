import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class LogAuditoria {
  @PrimaryGeneratedColumn()
  id_log?: number;

  @Column({ nullable: true })
  id_usuario?: number;

  @Column({ nullable: true })
  email_usuario?: string;

  @Column()
  acao!: string;

  @Column({ nullable: true })
  entidade?: string;

  @Column({ nullable: true })
  id_entidade?: string;

  @Column({ type: "text", nullable: true })
  detalhes?: string;

  @Column({ nullable: true })
  ip?: string;

  @CreateDateColumn()
  criado_em?: Date;
}

export default LogAuditoria;

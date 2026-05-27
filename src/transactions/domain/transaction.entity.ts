import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/domain/user.entity";

export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  REJECTED = "rejected",
}

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "sender_id" })
  sender!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "receiver_id" })
  receiver!: User;

  @Column("decimal", {
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  amount!: number;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ type: "varchar", nullable: true })
  rejection_reason!: string | null;

  @CreateDateColumn()
  date!: Date;
}

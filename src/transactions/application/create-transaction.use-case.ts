import { DataSource } from "typeorm";
import { CreateTransactionDTO } from "./create-transaction.dto";
import { User } from "../../users/domain/user.entity";
import { Transaction, TransactionStatus } from "../domain/transaction.entity";
import {
  InsufficientFundsError,
  InvalidAmountError,
  SameAccountTransferError,
} from "../domain/transaction.errors";

const MAX_VALUE_WITHOUT_APPROVAL = 50000;

export class CreateTransactionUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(dto: CreateTransactionDTO) {
    if (dto.amount <= 0) {
      throw new InvalidAmountError();
    }
    if (dto.senderId === dto.receiverId) {
      throw new SameAccountTransferError();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sender = await queryRunner.manager.findOne(User, {
        where: { id: dto.senderId },
        lock: { mode: "pessimistic_write" },
      });
      if (!sender) {
        throw new Error("Sender not found");
      }

      const receiver = await queryRunner.manager.findOne(User, {
        where: { id: dto.receiverId },
      });
      if (!receiver) {
        throw new Error("Receiver not found");
      }

      if (sender.balance < dto.amount) {
        throw new InsufficientFundsError();
      }
      const transaction = new Transaction();

      transaction.sender = sender;
      transaction.receiver = receiver;
      transaction.amount = dto.amount;

      if (dto.amount > MAX_VALUE_WITHOUT_APPROVAL) {
        transaction.status = TransactionStatus.PENDING;
      } else {
        transaction.status = TransactionStatus.CONFIRMED;

        sender.balance -= dto.amount;
        receiver.balance += dto.amount;

        await queryRunner.manager.save(sender);
        await queryRunner.manager.save(receiver);
      }

      const savedTransaction = await queryRunner.manager.save(
        Transaction,
        transaction,
      );

      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

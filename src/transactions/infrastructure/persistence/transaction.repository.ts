import { DataSource } from "typeorm";
import { ITransactionRepository } from "../../domain/transaction.repository.interface";
import {
  Transaction,
  TransactionStatus,
} from "../../domain/transaction.entity";
import { User } from "../../../users/domain/user.entity";
import { InsufficientFundsError } from "../../domain/transaction.errors";
import { Paginated } from "../../../core/domain/core.interface";

const MAX_VALUE_WITHOUT_APPROVAL = 50000;

export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly dataSource: DataSource) {}

  async createWithLock(
    senderId: string,
    receiverId: string,
    amount: number,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sender = await queryRunner.manager.findOne(User, {
        where: { id: senderId },
        lock: { mode: "pessimistic_write" },
      });
      if (!sender) {
        throw new Error("Sender not found");
      }

      const receiver = await queryRunner.manager.findOne(User, {
        where: { id: receiverId },
      });
      if (!receiver) {
        throw new Error("Receiver not found");
      }

      const sumPendingAmount = await queryRunner.manager
        .createQueryBuilder(Transaction, "transaction")
        .select("SUM(transaction.amount)", "totalPending")
        .where("transaction.sender_id = :senderId", { senderId })
        .andWhere("transaction.status = :status", {
          status: TransactionStatus.PENDING,
        })
        .getRawOne();

      const totalPendingAmount = Number(sumPendingAmount.totalPending) || 0;
      const availableBalance = Number(sender.balance) - totalPendingAmount;

      if (availableBalance < amount) {
        throw new InsufficientFundsError();
      }
      const transaction = new Transaction();

      transaction.sender = sender;
      transaction.receiver = receiver;
      transaction.amount = amount;

      if (amount > MAX_VALUE_WITHOUT_APPROVAL) {
        transaction.status = TransactionStatus.PENDING;
      } else {
        transaction.status = TransactionStatus.CONFIRMED;

        sender.balance -= amount;
        receiver.balance += amount;

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

  async findPaginatedByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Paginated<Transaction>> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.dataSource.manager.findAndCount(
      Transaction,
      {
        where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
        relations: { sender: true, receiver: true },
        order: { date: "DESC" },
        skip,
        take: limit,
      },
    );
    return { data: transactions, total, page, limit };
  }
}

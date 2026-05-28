import { DataSource, FindOptionsWhere } from "typeorm";
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
    userId: string | undefined,
    status: string | undefined,
    page: number,
    limit: number,
  ): Promise<Paginated<Transaction>> {
    const skip = (page - 1) * limit;

    const statusFilter = status ? { status: status as TransactionStatus } : {};

    const where = userId
      ? [
          { sender: { id: userId }, ...statusFilter },
          { receiver: { id: userId }, ...statusFilter },
        ]
      : statusFilter;

    const [transactions, total] = await this.dataSource.manager.findAndCount(
      Transaction,
      {
        where,
        relations: { sender: true, receiver: true },
        order: { date: "DESC" },
        skip,
        take: limit,
      },
    );
    return { data: transactions, total, page, limit };
  }

  async approve(transactionId: string): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionData = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionId },
        relations: { sender: true, receiver: true },
      });

      if (!transactionData) {
        throw new Error("Transaction not found");
      }

      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionId },
        lock: { mode: "pessimistic_write" },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new Error("Cannot approve a transaction that is not pending");
      }

      const sender = await queryRunner.manager.findOne(User, {
        where: { id: transactionData.sender.id },
        lock: { mode: "pessimistic_write" },
      });

      if (!sender) {
        throw new Error("Sender not found");
      }

      const receiver = await queryRunner.manager.findOne(User, {
        where: { id: transactionData.receiver.id },
      });

      if (!receiver) {
        throw new Error("Receiver not found");
      }

      transaction.sender = sender;
      transaction.receiver = receiver;

      if (Number(sender.balance) < Number(transaction.amount)) {
        throw new InsufficientFundsError();
      }

      sender.balance = Number(sender.balance) - Number(transaction.amount);
      receiver.balance = Number(receiver.balance) + Number(transaction.amount);
      transaction.status = TransactionStatus.CONFIRMED;

      await queryRunner.manager.save(User, sender);
      await queryRunner.manager.save(User, receiver);
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

  async reject(transactionId: string, reason: string): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionId },
        lock: { mode: "pessimistic_write" },
      });

      if (!transaction) throw new Error("Transaction not found");

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new Error("Cannot reject a transaction that is not pending");
      }

      transaction.status = TransactionStatus.REJECTED;

      transaction.rejectReason = reason;

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

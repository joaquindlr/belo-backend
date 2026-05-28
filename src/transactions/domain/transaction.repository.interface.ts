import { Paginated } from "../../core/domain/core.interface";
import { Transaction } from "./transaction.entity";

export interface ITransactionRepository {
  createWithLock(
    senderId: string,
    receiverId: string,
    amount: number,
  ): Promise<Transaction>;

  findPaginatedByUser(
    userId: string | undefined,
    status: string | undefined,
    page: number,
    limit: number,
  ): Promise<Paginated<Transaction>>;

  approve(transactionId: string): Promise<Transaction>;
  reject(transactionId: string, reason: string): Promise<Transaction>;
}

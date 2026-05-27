import { Transaction } from "./transaction.entity";

export interface ITransactionRepository {
  createWithLock(
    senderId: string,
    receiverId: string,
    amount: number,
  ): Promise<Transaction>;
}

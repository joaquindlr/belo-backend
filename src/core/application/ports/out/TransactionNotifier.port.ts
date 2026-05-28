import { Transaction } from "../../../../transactions/domain/transaction.entity";

export interface TransactionNotifierPort {
  notifyTransactionUpdated(transaction: Transaction): void;
}

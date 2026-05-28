import { ITransactionRepository } from "../../domain/transaction.repository.interface";
import { TransactionNotifierPort } from "../../../core/application/ports/out/TransactionNotifier.port";
import { Transaction } from "../../domain/transaction.entity";

export class RejectTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly notificationService: TransactionNotifierPort,
  ) {}

  async execute(transactionId: string, reason: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.reject(transactionId, reason);
    this.notificationService.notifyTransactionUpdated(transaction);
    return transaction;
  }
}

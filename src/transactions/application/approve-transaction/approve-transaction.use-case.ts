import { TransactionNotifierPort } from "../../../core/application/ports/out/TransactionNotifier.port";
import { ITransactionRepository } from "../../domain/transaction.repository.interface";
import { Transaction } from "../../domain/transaction.entity";

export class ApproveTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly notificationService: TransactionNotifierPort,
  ) {}

  async execute(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.approve(transactionId);
    this.notificationService.notifyTransactionUpdated(transaction);
    return transaction;
  }
}

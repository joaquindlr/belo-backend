import { ITransactionRepository } from "../../domain/transaction.repository.interface";

export class RejectTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(transactionId: string, reason: string): Promise<void> {
    await this.transactionRepository.reject(transactionId, reason);
  }
}

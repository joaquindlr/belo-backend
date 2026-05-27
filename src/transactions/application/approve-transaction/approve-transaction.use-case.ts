import { ITransactionRepository } from "../../domain/transaction.repository.interface";

export class ApproveTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(transactionId: string): Promise<void> {
    await this.transactionRepository.approve(transactionId);
  }
}

import { ITransactionRepository } from "../../domain/transaction.repository.interface";

export class GetTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(userId: string, page: number, limit: number) {
    return await this.transactionRepository.findPaginatedByUser(
      userId,
      page,
      limit,
    );
  }
}

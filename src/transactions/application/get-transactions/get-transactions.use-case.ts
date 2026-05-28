import { ITransactionRepository } from "../../domain/transaction.repository.interface";

export class GetTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(
    userId: string | undefined,
    status: string | undefined,
    page: number,
    limit: number,
  ) {
    return await this.transactionRepository.findPaginatedByUser(
      userId,
      status,
      page,
      limit,
    );
  }
}

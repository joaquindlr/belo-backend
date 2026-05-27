import { CreateTransactionDTO } from "./create-transaction.dto";

import {
  InvalidAmountError,
  SameAccountTransferError,
} from "../domain/transaction.errors";
import { ITransactionRepository } from "../domain/transaction.repository.interface";

export class CreateTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(dto: CreateTransactionDTO) {
    const { amount, senderId, receiverId } = dto;

    if (amount <= 0) throw new InvalidAmountError();

    if (senderId === receiverId) throw new SameAccountTransferError();

    return await this.transactionRepository.createWithLock(
      senderId,
      receiverId,
      amount,
    );
  }
}

import {
  InvalidAmountError,
  SameAccountTransferError,
} from "../domain/transaction.errors";
import { ITransactionRepository } from "../domain/transaction.repository.interface";
import { CreateTransactionUseCase } from "./create-transaction.use-case";

const transactionRepository = {
  createWithLock: jest.fn(),
} as ITransactionRepository;

describe("CreateTransactionUseCase", () => {
  const useCase = new CreateTransactionUseCase(transactionRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create transaction successfully", async () => {
    const dto = {
      senderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      receiverId: "550e8400-e29b-41d4-a716-446655440000",
      amount: 10000,
    };
    await useCase.execute(dto);

    expect(transactionRepository.createWithLock).toHaveBeenCalledWith(
      dto.senderId,
      dto.receiverId,
      dto.amount,
    );
  });

  it("should throw InvalidAmountError for negative amount", async () => {
    const dto = {
      senderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      receiverId: "550e8400-e29b-41d4-a716-446655440000",
      amount: -1,
    };
    await expect(useCase.execute(dto)).rejects.toThrow(InvalidAmountError);
  });

  it("should throw SameAccountTransferError when sender equals receiver", async () => {
    const dto = {
      senderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      receiverId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      amount: 10000,
    };
    await expect(useCase.execute(dto)).rejects.toThrow(
      SameAccountTransferError,
    );
  });
});

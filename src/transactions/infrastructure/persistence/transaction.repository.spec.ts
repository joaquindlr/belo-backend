import { DataSource } from "typeorm";
import { TransactionRepository } from "./transaction.repository";
import { User } from "../../../users/domain/user.entity";
import { TransactionStatus } from "../../domain/transaction.entity";

describe("TransactionRepository", () => {
  let repository: TransactionRepository;

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: mockManager,
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const dataSourceMock = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
  } as any as DataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TransactionRepository(dataSourceMock);
  });

  it("should create a CONFIRMED transaction and update balances if the amount is <= 50000", async () => {
    const mockSender = {
      id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      balance: 100000,
    } as User;
    const mockReceiver = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      balance: 0,
    } as User;

    mockManager.findOne
      .mockResolvedValueOnce(mockSender)
      .mockResolvedValueOnce(mockReceiver);

    mockManager.save.mockResolvedValue({
      status: TransactionStatus.CONFIRMED,
      amount: 10000,
    });

    const result = await repository.createWithLock(
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "550e8400-e29b-41d4-a716-446655440000",
      10000,
    );

    expect(result.status).toBe(TransactionStatus.CONFIRMED);
    expect(result.amount).toBe(10000);

    expect(mockSender.balance).toBe(90000);
    expect(mockReceiver.balance).toBe(10000);

    expect(mockManager.save).toHaveBeenCalledTimes(3);

    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });

  it("should create a PENDING transaction if the amount is > 50000", async () => {
    const mockSender = {
      id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      balance: 100000,
    } as User;
    const mockReceiver = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      balance: 0,
    } as User;

    mockManager.findOne
      .mockResolvedValueOnce(mockSender)
      .mockResolvedValueOnce(mockReceiver);

    mockManager.save.mockResolvedValue({
      status: TransactionStatus.PENDING,
      amount: 60000,
    });

    const result = await repository.createWithLock(
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "550e8400-e29b-41d4-a716-446655440000",
      60000,
    );

    expect(result.status).toBe(TransactionStatus.PENDING);
    expect(result.amount).toBe(60000);

    expect(mockSender.balance).toBe(100000);
    expect(mockReceiver.balance).toBe(0);

    expect(mockManager.save).toHaveBeenCalled();

    expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });

  it("should rollback transaction if sender is null", async () => {
    const mockSender = null;

    mockManager.findOne.mockResolvedValueOnce(mockSender);

    await expect(
      repository.createWithLock(
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "550e8400-e29b-41d4-a716-446655440000",
        10000,
      ),
    ).rejects.toThrow("Sender not found");

    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });

  it("should rollback transaction if receiver is null", async () => {
    const mockSender = {
      id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      balance: 100000,
    } as User;

    const mockReceiver = null;
    mockManager.findOne
      .mockResolvedValueOnce(mockSender)
      .mockResolvedValueOnce(mockReceiver);

    await expect(
      repository.createWithLock(
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "550e8400-e29b-41d4-a716-446655440000",
        10000,
      ),
    ).rejects.toThrow("Receiver not found");

    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });

  it("should rollback transaction if sender has insufficient funds", async () => {
    const mockSender = {
      id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      balance: 5000,
    } as User;

    const mockReceiver = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      balance: 0,
    } as User;

    mockManager.findOne
      .mockResolvedValueOnce(mockSender)
      .mockResolvedValueOnce(mockReceiver);

    await expect(
      repository.createWithLock(
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "550e8400-e29b-41d4-a716-446655440000",
        10000,
      ),
    ).rejects.toThrow(
      "No disponés de saldo suficiente para realizar esta operación.",
    );

    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunnerMock.release).toHaveBeenCalled();
  });
});

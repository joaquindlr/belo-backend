import Fastify, { FastifyInstance } from "fastify";
import { CreateTransactionUseCase } from "../../application/create-transaction/create-transaction.use-case";
import { TransactionStatus } from "../../domain/transaction.entity";
import {
  InsufficientFundsError,
  InvalidAmountError,
} from "../../domain/transaction.errors";
import createTransactionController from "./create-transaction.controller";

jest.mock("../../../core/infrastructure/database/data-source", () => ({
  AppDataSource: {},
}));
jest.mock("../persistence/transaction.repository");
jest.mock("../../application/create-transaction.use-case");

const MockedUseCase = CreateTransactionUseCase as jest.MockedClass<
  typeof CreateTransactionUseCase
>;
describe("createTransactionController", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(createTransactionController);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 201 for confirmed transactions", async () => {
    const mockTransaction = {
      id: "transaction-123",
      status: TransactionStatus.CONFIRMED,
      amount: 10000,
    };
    MockedUseCase.prototype.execute.mockResolvedValueOnce(
      mockTransaction as any,
    );

    const response = await app.inject({
      method: "POST",
      url: "/transactions",
      payload: {
        senderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        receiverId: "550e8400-e29b-41d4-a716-446655440000",
        monto: 10000,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(mockTransaction);
  });

  it("should return 202 for pending transactions", async () => {
    const mockTransaction = {
      id: "transaction-456",
      status: TransactionStatus.PENDING,
      amount: 60000,
    };
    MockedUseCase.prototype.execute.mockResolvedValueOnce(
      mockTransaction as any,
    );

    const response = await app.inject({
      method: "POST",
      url: "/transactions",
      payload: {
        senderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        receiverId: "550e8400-e29b-41d4-a716-446655440000",
        monto: 60000,
      },
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual(mockTransaction);
  });

  it("should return 422 when insufficient funds", async () => {
    const error = new InsufficientFundsError();
    MockedUseCase.prototype.execute.mockRejectedValueOnce(error);

    const response = await app.inject({
      method: "POST",
      url: "/transactions",
      payload: {
        senderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        receiverId: "550e8400-e29b-41d4-a716-446655440000",
        monto: 10000,
      },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().message).toBe(error.message);
  });

  it("should return 400 if the amount is invalid", async () => {
    const error = new InvalidAmountError();
    MockedUseCase.prototype.execute.mockRejectedValueOnce(error);

    const response = await app.inject({
      method: "POST",
      url: "/transactions",
      payload: {
        senderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        receiverId: "550e8400-e29b-41d4-a716-446655440000",
        monto: -500,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toBe(error.message);
  });

  it("should return 500 when there is an internal server error", async () => {
    MockedUseCase.prototype.execute.mockRejectedValueOnce(
      new Error("Unexpected error"),
    );

    const response = await app.inject({
      method: "POST",
      url: "/transactions",
      payload: {
        senderId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        receiverId: "550e8400-e29b-41d4-a716-446655440000",
        monto: 10000,
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json().code).toBe("INTERNAL_SERVER_ERROR");
  });
});

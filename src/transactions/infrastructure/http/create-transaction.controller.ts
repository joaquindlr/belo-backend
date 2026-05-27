import { FastifyPluginAsync } from "fastify";
import { CreateTransactionUseCase } from "../../application/create-transaction/create-transaction.use-case";
import { AppDataSource } from "../../../core/infrastructure/database/data-source";
import { CreateTransactionDTO } from "../../application/create-transaction/create-transaction.dto";
import { TransactionStatus } from "../../domain/transaction.entity";
import {
  InsufficientFundsError,
  InvalidAmountError,
  SameAccountTransferError,
} from "../../domain/transaction.errors";
import { TransactionRepository } from "../persistence/transaction.repository";

const createTransactionController: FastifyPluginAsync = async (fastify) => {
  const transactionRepository = new TransactionRepository(AppDataSource);
  const createTransactionUseCase = new CreateTransactionUseCase(
    transactionRepository,
  );

  fastify.post("/transactions", async (request, reply) => {
    const dto = request.body as CreateTransactionDTO;
    try {
      const result = await createTransactionUseCase.execute(dto);

      const statusCode =
        result.status === TransactionStatus.PENDING ? 202 : 201;

      return reply.status(statusCode).send(result);
    } catch (error: any) {
      if (error instanceof InsufficientFundsError) {
        return reply.code(422).send({
          code: InsufficientFundsError.code,
          message: error.message,
        });
      }

      if (
        error instanceof InvalidAmountError ||
        error instanceof SameAccountTransferError
      ) {
        return reply.code(400).send({
          code: InvalidAmountError.code,
          message: error.message,
        });
      }

      fastify.log.error(error);
      return reply.code(500).send({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Ocurrió un error inesperado al procesar la transacción, intente de nuevo más tarde.",
      });
    }
  });
};

export default createTransactionController;

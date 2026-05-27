import { FastifyPluginAsync } from "fastify";
import { TransactionRepository } from "../persistence/transaction.repository";
import { AppDataSource } from "../../../core/infrastructure/database/data-source";
import { GetTransactionsUseCase } from "../../application/get-transactions/get-transactions.use-case";
import { GetTransactionsDTO } from "../../application/get-transactions/get-transactions.dto";

const getTransactionsController: FastifyPluginAsync = async (fastify) => {
  const transactionRepository = new TransactionRepository(AppDataSource);
  const getTransactionsUseCase = new GetTransactionsUseCase(
    transactionRepository,
  );

  fastify.get("/transactions", async (request, reply) => {
    const { userId, page, limit } = request.query as GetTransactionsDTO;
    try {
      const transactions = await getTransactionsUseCase.execute(
        userId,
        page,
        limit,
      );
      await reply.send(transactions);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Ocurrió un error inesperado al obtener las transacciones, intente de nuevo más tarde.",
      });
    }
  });
};

export default getTransactionsController;

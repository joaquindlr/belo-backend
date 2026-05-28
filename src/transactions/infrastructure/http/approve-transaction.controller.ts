import { FastifyPluginAsync } from "fastify";
import { TransactionRepository } from "../persistence/transaction.repository";
import { AppDataSource } from "../../../core/infrastructure/database/data-source";
import { ApproveTransactionUseCase } from "../../application/approve-transaction/approve-transaction.use-case";
import { approveTransactionSchema } from "./schemas/approve-transaction.schema";
import { WebSocketTransactionNotifier } from "../../../core/infrastructure/adapters/WebSocketTransactionNotifier.adapter";

const approveTransactionController: FastifyPluginAsync = async (fastify) => {
  const transactionRepository = new TransactionRepository(AppDataSource);
  const transactionNotifier = new WebSocketTransactionNotifier();
  const approveTransactionUseCase = new ApproveTransactionUseCase(
    transactionRepository,
    transactionNotifier,
  );
  fastify.patch(
    "/transactions/:id/approve",
    {
      schema: approveTransactionSchema,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const transaction = await approveTransactionUseCase.execute(id);
        await reply.send(transaction);
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Ocurrió un error inesperado al obtener las transacciones, intente de nuevo más tarde.",
        });
      }
    },
  );
};

export default approveTransactionController;

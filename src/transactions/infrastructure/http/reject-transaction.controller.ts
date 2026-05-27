import { FastifyPluginAsync } from "fastify";
import { TransactionRepository } from "../persistence/transaction.repository";
import { AppDataSource } from "../../../core/infrastructure/database/data-source";
import { RejectTransactionUseCase } from "../../application/reject-transaction/reject-transaction.use-case";
import { rejectTransactionSchema } from "./schemas/reject-transaction.schema";

const rejectTransactionController: FastifyPluginAsync = async (fastify) => {
  const transactionRepository = new TransactionRepository(AppDataSource);
  const rejectTransactionUseCase = new RejectTransactionUseCase(
    transactionRepository,
  );
  fastify.patch(
    "/transactions/:id/reject",
    {
      schema: rejectTransactionSchema,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { reason } = request.body as { reason: string };

        const transaction = await rejectTransactionUseCase.execute(id, reason);
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

export default rejectTransactionController;

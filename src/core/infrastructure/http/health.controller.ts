import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { healthSchema } from "./schemas/health.schema";

const healthController: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    "/health",
    {
      schema: healthSchema,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.code(200).send({
        status: "ok",
      });
    },
  );
};

export default healthController;

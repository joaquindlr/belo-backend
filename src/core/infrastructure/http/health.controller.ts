import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";

const healthController: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    "/health",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.code(200).send({
        status: "ok",
      });
    },
  );
};

export default healthController;

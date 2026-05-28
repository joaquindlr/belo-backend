import { FastifyPluginAsync } from "fastify";
import { AppDataSource } from "../../../core/infrastructure/database/data-source";
import { User } from "../../domain/user.entity";

const getUsersController: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/users",
    async (request, reply) => {
      try {
        const users = await AppDataSource.manager.find(User);
        await reply.send(users);
      } catch (error: any) {
        fastify.log.error(error);
        return reply.code(500).send({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ocurrió un error inesperado al obtener los usuarios.",
        });
      }
    },
  );
};

export default getUsersController;

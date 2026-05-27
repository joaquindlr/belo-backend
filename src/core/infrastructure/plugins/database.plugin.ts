import fp from "fastify-plugin";
import { AppDataSource } from "../database/data-source";

export default fp(async (fastify, opts) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      fastify.log.info("PostgreSQL connection established successfully.");
    }
  } catch (error) {
    fastify.log.error(error, "Error connecting to PostgreSQL");
    process.exit(1);
  }

  fastify.addHook("onClose", async (instance) => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
});

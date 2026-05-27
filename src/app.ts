import { join } from "node:path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import "reflect-metadata";

export interface AppOptions
  extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "core/infrastructure/plugins"),
    options: opts,
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname),
    matchFilter: /.*\.controller\.(ts|js)$/,
    dirNameRoutePrefix: false,
    options: opts,
  });
};

export default app;
export { app, options };

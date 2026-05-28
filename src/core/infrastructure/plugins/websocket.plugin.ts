import fp from "fastify-plugin";
import fastifyWebsocket from "@fastify/websocket";
import { websocketRoutes } from "../http/websocket.router";

export default fp(async (fastify) => {
  await fastify.register(fastifyWebsocket, {
    options: { maxPayload: 1048576 },
  });

  await fastify.register(websocketRoutes);

  fastify.log.info("WebSocket Plugin registrado y rutas activas");
});

import { FastifyInstance } from "fastify";
import { wsEventEmitter } from "../adapters/WebSocketTransactionNotifier.adapter";

export async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get("/ws/transactions", { websocket: true }, (connection: any) => {
    const socket = connection.socket || connection;

    if (!socket || typeof socket.on !== "function") {
      fastify.log.warn(
        "Se intentó una conexión WebSocket pero el socket no es válido",
      );
      return;
    }

    const onTransactionUpdated = (data: any) => {
      if (socket.readyState === 1) {
        try {
          socket.send(JSON.stringify(data));
        } catch (error) {
          fastify.log.error(
            { err: error },
            "Error al enviar notificación via WebSocket",
          );
        }
      }
    };

    wsEventEmitter.on("transaction_updated", onTransactionUpdated);

    const cleanup = () => {
      wsEventEmitter.off("transaction_updated", onTransactionUpdated);
    };

    socket.on("close", cleanup);
    socket.on("error", (err: any) => {
      fastify.log.error({ err }, "Error en conexión WebSocket");
      cleanup();
    });
  });
}

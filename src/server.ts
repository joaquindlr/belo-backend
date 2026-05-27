import Fastify from "fastify";
import app from "./app";

const server = Fastify({
  logger: true,
});

server.register(app);

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server listening at http://0.0.0.0:3000");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();

import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export default fp(async (fastify) => {
  const errorSchema = {
    $id: "Error",
    type: "object",
    properties: {
      code: { type: "string" },
      message: { type: "string" },
    },
  } as const;

  fastify.addSchema(errorSchema);

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Belo Challenge API",
        description: "API for managing transactions",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local server",
        },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
});

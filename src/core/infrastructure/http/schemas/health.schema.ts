export const healthSchema = {
  description: "Check the health of the application",
  tags: ["System"],
  response: {
    200: {
      description: "Success Response",
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
      },
    },
  },
};

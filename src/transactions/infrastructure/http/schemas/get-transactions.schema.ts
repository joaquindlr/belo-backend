export const getTransactionsSchema = {
  description: "Get a list of transactions",
  tags: ["Transactions"],
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string", format: "uuid" },
      status: { type: "string", enum: ["pending", "confirmed", "rejected"] },
      page: { type: "integer", minimum: 1, default: 1 },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: {
      description: "A list of transactions",
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              amount: { type: "number" },
              status: { type: "string" },
              date: { type: "string", format: "date-time" },
              rejectReason: { type: ["string", "null"] },
              sender: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
              receiver: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        total: { type: "integer" },
        page: { type: "integer" },
        limit: { type: "integer" },
      },
    },
    500: { $ref: "Error#" },
  },
};

export const getTransactionsSchema = {
  description: "Get a list of transactions for a user",
  tags: ["Transactions"],
  querystring: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: { type: "string", format: "uuid" },
      page: { type: "integer", minimum: 1, default: 1 },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
    },
  },
  response: {
    200: {
      description: "A list of transactions",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          amount: { type: "number" },
          status: { type: "string" },
          date: { type: "string", format: "date-time" },
        },
      },
    },
    500: { $ref: "Error#" },
  },
};

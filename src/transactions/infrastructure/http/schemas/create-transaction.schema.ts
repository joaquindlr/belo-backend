export const createTransactionSchema = {
  description: "Create a new transaction.",
  tags: ["Transactions"],
  body: {
    type: "object",
    required: ["senderId", "receiverId", "amount"],
    properties: {
      senderId: { type: "string", format: "uuid" },
      receiverId: { type: "string", format: "uuid" },
      amount: { type: "number", minimum: 0.01 },
    },
  },
  response: {
    201: {
      description: "Transaction created successfully",
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        amount: { type: "number" },
        status: { type: "string", enum: ["confirmed"] },
        date: { type: "string", format: "date-time" },
      },
    },
    202: {
      description: "Transaction created in pending state",
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        amount: { type: "number" },
        status: { type: "string", enum: ["pending"] },
        date: { type: "string", format: "date-time" },
      },
    },
    400: { $ref: "Error#" },
    422: { $ref: "Error#" },
    500: { $ref: "Error#" },
  },
};

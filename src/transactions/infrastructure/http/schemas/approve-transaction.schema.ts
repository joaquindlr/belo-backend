export const approveTransactionSchema = {
  description: "Approve a pending transaction",
  tags: ["Transactions"],
  params: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
  response: {
    200: {
      description: "Transaction approved successfully",
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        status: { type: "string", enum: ["confirmed"] },
      },
    },
    500: { $ref: "Error#" },
  },
};

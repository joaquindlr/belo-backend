export const rejectTransactionSchema = {
  description: "Reject a pending transaction",
  tags: ["Transactions"],
  params: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
  body: {
    type: "object",
    required: ["reason"],
    properties: {
      reason: { type: "string" },
    },
  },
  response: {
    200: {
      description: "Transaction rejected successfully",
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        status: { type: "string", enum: ["rejected"] },
        rejectReason: { type: "string" },
      },
    },
    500: { $ref: "Error#" },
  },
};

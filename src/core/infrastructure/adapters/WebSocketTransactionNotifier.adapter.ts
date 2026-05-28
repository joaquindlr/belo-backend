import { EventEmitter } from "events";
import { Transaction } from "../../../transactions/domain/transaction.entity";
import { TransactionNotifierPort } from "../../application/ports/out/TransactionNotifier.port";

export const wsEventEmitter = new EventEmitter();

export class WebSocketTransactionNotifier implements TransactionNotifierPort {
  notifyTransactionUpdated(transaction: Transaction): void {
    const payload = {
      type: "TRANSACTION_UPDATED",
      payload: {
        id: transaction.id,
        status: transaction.status,
      },
    };

    wsEventEmitter.emit("transaction_updated", payload);
  }
}

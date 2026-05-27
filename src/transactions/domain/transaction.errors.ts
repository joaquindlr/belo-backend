export abstract class TransactionDomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InsufficientFundsError extends TransactionDomainError {
  static readonly code = "INSUFFICIENT_FUNDS";

  constructor() {
    super("No disponés de saldo suficiente para realizar esta operación.", InsufficientFundsError.code);
  }
}

export class SameAccountTransferError extends TransactionDomainError {
  static readonly code = "INVALID_TRANSACTION";

  constructor() {
    super("El origen y el destino no pueden ser el mismo usuario.", SameAccountTransferError.code);
  }
}

export class InvalidAmountError extends TransactionDomainError {
  static readonly code = "INVALID_TRANSACTION";

  constructor() {
    super("El monto de la transacción debe ser mayor a cero.", InvalidAmountError.code);
  }
}

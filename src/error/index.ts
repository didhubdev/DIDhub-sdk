

export enum ErrorName {
    OpenseaException = "OpenseaException",
    RateLimitException = "RateLimitException",
    OrderDataException = "OrderDataException",
    ContractTransactionException = "ContractTransactionException"
}

export class OpenseaException extends Error {
    public details: any;
    public errorCode: string;  
    
    constructor(message: string, errorCode: string) {
      super(message);
      this.name = ErrorName.OpenseaException;
      this.errorCode = errorCode;
      Object.setPrototypeOf(this, OpenseaException.prototype);
    }
}

export class RateLimitException extends Error {
    public errorCode: string;
    public details: any;
  
    constructor(message: string, errorCode: string) {
      super(message);
      this.name = ErrorName.RateLimitException;
      this.errorCode = errorCode;
      Object.setPrototypeOf(this, RateLimitException.prototype);
    }
}
  

export class OrderDataException extends Error {
    public details: any;
    public errorCode: string;  
    
    constructor(message: string, errorCode: string) {
      super(message);
      this.name = ErrorName.OrderDataException;
      this.errorCode = errorCode;
      Object.setPrototypeOf(this, OrderDataException.prototype);
    }
}

export class ContractTransactionException extends Error {
    public details: any;
    public errorCode: string;  
    
    constructor(message: string, errorCode: string) {
      super(message);
      this.name = ErrorName.ContractTransactionException;
      this.errorCode = errorCode;
      Object.setPrototypeOf(this, ContractTransactionException.prototype);
    }
}
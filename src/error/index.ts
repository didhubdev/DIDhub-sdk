import { ContractTransactionResponse } from "ethers";


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

export async function executeTransaction<T>(
  txPromise: Promise<T>
): Promise<T> {

  let tx: T;

  // First, try to send the transaction
  try {
    tx = await txPromise;
    if (!tx) {
      throw new Error("Transaction submission returned null or undefined");
    }
  } catch (submissionError: any) {
    console.error("Error during transaction submission:", submissionError);
    throw new ContractTransactionException(submissionError?.toString(), "800");
  }

  return tx;
}
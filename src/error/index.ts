


export class OpenseaException extends Error {
    public details: any;
    public errorCode: string;  
    
    constructor(message: string, errorCode: string) {
      super(message);
      this.name = "OpenseaException";
      this.errorCode = errorCode;
      Object.setPrototypeOf(this, OpenseaException.prototype);
    }
}

export class RateLimitException extends Error {
    public errorCode: string;
    public details: any;
  
    constructor(message: string, errorCode: string) {
      super(message);
      this.name = "RateLimitException";
      this.errorCode = errorCode;
      Object.setPrototypeOf(this, RateLimitException.prototype);
    }
}
  

export class OrderDataException extends Error {
    public details: any;
    public errorCode: string;  
    
    constructor(message: string, errorCode: string) {
      super(message);
      this.name = "OrderDataException";
      this.errorCode = errorCode;
      Object.setPrototypeOf(this, OrderDataException.prototype);
    }
}
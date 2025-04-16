import { Data } from '../../contracts/didhub/batchRegister/BatchRegister';
import { ContractTransactionResponse, BigNumberish, JsonRpcSigner } from 'ethers';

export interface IDomainInfo {
    collectionInfo: string
    nameKey: string;
    duration?: BigNumberish;
}

export interface IRegistrationData {
    requests: Data.RegistrationInfoStruct[];
    paymentToken: string;
    paymentMax: BigNumberish;
}

export interface IRenewData {
    requests: Data.RenewInfoStruct[];
    paymentToken: string;
    paymentMax: BigNumberish;
}

export interface IPurchaseCheck {
    success: boolean;
    errors: string[];
    commitmentStatus: number[];
    availabilityStatus: boolean[];
}

export interface IRenewCheck {
    success: boolean;
    errors: string[];
}

export interface ITokenInfo {
    name: string,
    address: string,
    decimals: number,
    isNativeWrappedToken?: boolean
}

export interface IBatchRegister {
    
    /**
     * @dev check the status of the commitment
     *  0: not exist, requires commit
     *  1: available but before minCommitmentAge
     *  2: available and after minCommitmentAge and before maxCommitmentAge, or does not require commitment
     *  3: available and after maxCommitmentAge, requires commit
     *  4: commit not required
     * 
     * @param domains The list of domains to check
     * @returns The list of status of the domains
     */
    batchCheckCommitment: (domains: IDomainInfo[]) => Promise<number[]>;

    /**
     * @dev get the commitment hashes for the domains, grouped by project
     * 
     * @param domains The list of domains to check
     * @returns The list of commitment hashes grouped by project
     */
    batchMakeCommitments: (domains: IDomainInfo[]) => Promise<Data.CommitmentInfoStruct[]>;
    
    /**
     * @dev commit the domains
     * 
     * @param commitmentInfos The list of commitment infos, it is the output of batchMakeCommitments function
     * 
     * @return The transaction object
     */
    batchCommit: (commitmentInfos: Data.CommitmentInfoStruct[]) => Promise<ContractTransactionResponse>;

    /**
     * @dev check the availability status of the domain
     * 
     * @param domains The list of domains to check
     * 
     * @returns The list of status of the domains
     */
    batchCheckAvailability: (domains: IDomainInfo[]) => Promise<boolean[]>;
   
    /**
     * 
     * @dev get total price of the domains summed by project
     * 
     * @param domains The list of domains to check
     * @returns The list of total price of the domains summed by project
     */
    getTotalPrice: (domains: IDomainInfo[], paymentToken: string) => Promise<bigint[]>;

    /**
     * @dev get individual price of the domains
     * 
     * @param domains The list of domains to check
     * 
     * @returns The list of individual price of each domains
     */
    getIndividualPrice: (domains: IDomainInfo[]) => Promise<Data.DomainPriceInfoStruct[]>;
    
    /**
     * @dev Get the price data necessary for batch register with a specific margin apply
     * 
     * @param domains The list of domains to check 
     * @params paymentToken The address of the payment token
     * @params margin The margin to apply in percentage, i.e. 3 for 3%
     * 
     * @returns The price data necessary for batch register
     */    
    getPriceWithMargin: (domains: IDomainInfo[], paymentToken: string, margin: number) => Promise<IRegistrationData>;
    
    /**
     * @dev Check whether the domain is ready for registration. Examine based on the token balance of the signer, 
     * whether the token approval is sufficient, the commitment status, and the availability status
     * 
     * @param domains The list of domains to register
     * @param paymentToken The address of the payment token
     * @param paymentMax The maximum amount of payment token to be used, for registering all domains
     * 
     * @return {success, errors, commitmentStatus, availabilityStatus}
     * success: boolean, whether the domain is ready for registration
     * errors: string[], the list of errors
     * commitmentStatus: number[], the list of commitment status for each domain
     * availabilityStatus: boolean[], the list of availability status for each domain
     */    
    checkPurchaseConditions: (
        domains: IDomainInfo[],
        paymentToken: string,
        paymentMax: BigNumberish
    ) => Promise<IPurchaseCheck>;


    /**
     * @dev get token balance of the signer
     * 
     * @param paymentToken The address of the payment token
     * @returns The balance of the signer for the payment token
     */
    getERC20Balance: (
        paymentToken: string
    ) => Promise<BigNumberish>;

    /**
     * @dev Approve the ERC20 token for the contract to use, return null if the approval is not needed
     * 
     * @param paymentToken The address of the payment token
     * @param paymentMax The approval needed
     * @return The transaction object or null if the approval is not needed
     */
    approveERC20Tokens: (
        paymentToken: string,
        paymentMax: BigNumberish
    ) => Promise<ContractTransactionResponse | null>;

    /**
     * @dev Batch register the domains. Use the getPriceWithMargin function to get the necessary data before calling this function.
     * Please ensure everything is ready before calling this function. Check any potential error by calling checkPurchaseConditions function.
     * Use zero address for paymentToken for native token
     * 
     * @param requests The information to register the domains
     * @returns The transaction object
     */
    batchRegister: (
        requests: Data.RegistrationInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish,
        maxFeePerGas?: BigNumberish
    ) => Promise<ContractTransactionResponse>;

    /**
     * @dev Check whether the domain is ready for renew. Examine based on the token balance of the signer, 
     * whether the token approval is sufficient, and the ownership status
     * 
     * @param paymentToken The address of the payment token
     * @param paymentMax The maximum amount of payment token to be used, for registering all domains
     * 
     * @return {success, errors, commitmentStatus, availabilityStatus}
     * success: boolean, whether the domain is ready for registration
     * errors: string[], the list of errors
     */ 
    checkRenewConditions: (
        paymentToken: string,
        paymentMax: BigNumberish
    ) => Promise<IRenewCheck>;
    
    /**
     * @dev Get the price data necessary for batch renew with a specific margin apply
     * 
     * @param domains The list of domains to check 
     * @params paymentToken The address of the payment token
     * @params margin The margin to apply in percentage, i.e. 3 for 3%
     * 
     * @returns The price data necessary for batch renew
     */    
    getRenewPriceWithMargin: (domains: IDomainInfo[], paymentToken: string, margin: number) => Promise<IRenewData>;

    /**
     * @dev Batch renew the domains. Use the getPriceWithMargin function to get the necessary data before calling this function.
     * Please ensure everything is ready before calling this function. Check any potential error by calling checkRenewConditions function.
     * Use zero address for paymentToken for native token
     * 
     * @param requests The information to register the domains
     * @returns The transaction object
     */
    batchRenew: (
        requests: Data.RenewInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ) => Promise<ContractTransactionResponse>;
        
    /**
     * @dev Get the list of supported tokens
     * 
     * @param chain The chain name given by didhub api, i.e. "Ethereum", "Arbitrum", "Polygon", "BNB Chain"
     * @return The list of supported tokens
     */
    getSupportedTokens: (chain: string) => Promise<ITokenInfo[]>;

    
    /**
     * @dev Get the fee for the batch register
     * 
     * @return The percentage fee for the batch register collected by DIDhub. 10 means 10%
     */
    didhubFee: () => Promise<number>;

    /**
     * @dev A set of functions to estimate the gas cost of the transactions
     */
    estimateGas: {
        batchCommit: (
            domainCount: number
        ) => Promise<bigint>;
        batchRegister: (
            domainCount: number
        ) => Promise<bigint>;
        batchRenew: (
            domainCount: number
        ) => Promise<bigint>;
        approveERC20Tokens: (
            paymentToken: string,
            paymentMax: BigNumberish
        ) => Promise<bigint>;
    }
}

export type IBatchRegistration = (
    signer: JsonRpcSigner,
    secret: string
) => IBatchRegister;
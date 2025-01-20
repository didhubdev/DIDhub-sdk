import { BigNumberish, ContractTransactionResponse, JsonRpcSigner } from 'ethers';

export interface IBatchENSManager {
    
    /**
     * @dev Get the fixed fee of the contract interaction
     * 
     * @return BigNumberish The fee in wei
     */
    getFixedFee: () => Promise<BigNumberish>,

    /**
     * @dev Check if the user has enough balance to pay for the fixed fee
     * 
     * @return boolean
     */
    checkFee: () => Promise<boolean>,

    /**
     * @dev Check if the domain name is wrapped
     * 
     * @param nameKeys An array of domain nameKeys
     * 
     * @return boolean[]
     */
    batchCheckWrapStatus: (nameKeys: string[]) => Promise<boolean[]>,

    /**
     * @dev batch check the owner status if the domain is shown as unwrapped
     * 
     * @param nameKeys 
     * 
     * @returns boolean[]
     */
    batchCheckUnwrappedETH2LDOwnerStatus : (nameKeys: string[]) => Promise<boolean[]>,

    /**
     * @dev batch check the owner status if the domain is shown as wrapped
     * 
     * @param nameKeys
     * 
     * @returns boolean[]
     */
    batchCheckWrappedETH2LDOwnerStatus: (nameKeys: string[]) => Promise<boolean[]>,

    /**
     * @dev Check if the user has approved the contract to spend the unwrapped tokens
     * 
     * @param names An array of domain names
     * 
     * @return boolean[]
     */
    batchCheckUnwrappedETH2LDApproval: (nameKeys: string[]) => Promise<boolean[]>,

    /**
     * @dev Check if the user has approved the contract to spend the wrapped tokens
     * 
     * @param nameKeys An array of domain nameKeys
     * 
     * @return boolean[]
     */
    batchCheckWrappedETH2LDApproval: (nameKeys: string[]) => Promise<boolean[]>,

    /**
     * @dev Unwrap the 2LD domain name
     * 
     * @param nameKeys An array of domain nameKeys
     * @param to The address to receive the unwrapped tokens
     * 
     * @return ContractTransaction
     */
    batchUnwrap: (nameKeys: string[], to?: string) => Promise<ContractTransactionResponse>,

    /**
     * @dev Wrap the 2LD domain name
     * 
     * @param nameKeys An array of domain nameKeys
     * @param to The address to receive the wrapped tokens
     * 
     * @return ContractTransaction
     */
    batchWrap: (nameKeys: string[], to?: string) => Promise<ContractTransactionResponse>

    /**
     * @dev Approve the base implementation contract (Old ENS contract) to spend the token
     * 
     * @return ContractTransaction | null if already approved
     */
    approveUnwrappedETH2LDDomains: () => Promise<ContractTransactionResponse | null>,

    /**
     * @dev Approve the name wrapper contract to spend the token
     * 
     * @return ContractTransaction | null if already approved
     */
    approveWrappedETH2LDDomains: () => Promise<ContractTransactionResponse | null>,


    /**
     * @dev Get the gas estimate for the transaction
     */
    estimateGas: {
        batchUnwrap: (nameKeys: string[], to?: string) => Promise<bigint>,
        batchWrap: (nameKeys: string[], to?: string) => Promise<bigint>,
        approveUnwrappedETH2LDDomains: () => Promise<bigint>,
        approveWrappedETH2LDDomains: () => Promise<bigint>
    }
}

export type IBatchENSManagerInit = (
    signer: JsonRpcSigner
) => IBatchENSManager;
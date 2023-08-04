import { BigNumberish, providers, ContractTransaction } from 'ethers';

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
     * @param names An array of domain names
     * 
     * @return boolean[]
     */
    batchCheckWrapStatus: (names: string[]) => Promise<boolean[]>,

    /**
     * @dev batch check the owner status if the domain is shown as unwrapped
     * 
     * @param names 
     * 
     * @returns boolean[]
     */
    batchCheckOwnerStatus : (names: string[]) => Promise<boolean[]>,

    /**
     * @dev Check if the user has approved the contract to spend the unwrapped tokens
     * 
     * @param names An array of domain names
     * 
     * @return boolean[]
     */
    batchCheckUnwrappedETH2LDApproval: (names: string[]) => Promise<boolean[]>,

    /**
     * @dev Check if the user has approved the contract to spend the wrapped tokens
     * 
     * @param names An array of domain names
     * 
     * @return boolean[]
     */
    batchCheckWrappedETH2LDApproval: (names: string[]) => Promise<boolean[]>,

    /**
     * @dev Unwrap the 2LD domain name
     * 
     * @param names An array of domain names
     * @param to The address to receive the unwrapped tokens
     * 
     * @return ContractTransaction
     */
    batchUnwrap: (names: string[], to: string) => Promise<ContractTransaction>,

    /**
     * @dev Wrap the 2LD domain name
     * 
     * @param names An array of domain names
     * @param to The address to receive the wrapped tokens
     * 
     * @return ContractTransaction
     */
    batchWrap: (names: string[], to: string) => Promise<ContractTransaction>

}

export type IBatchENSManagerInit = (
    provider: providers.JsonRpcSigner
) => IBatchENSManager;
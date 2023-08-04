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
    batchCheckOwnerStatus : (nameKeys: string[]) => Promise<boolean[]>,

    /**
     * @dev batch check the owner status if the domain is shown as wrapped
     * 
     * @param nameKeys
     * 
     * @returns boolean[]
     */
    batchCheckNameWrapperOwnerStatus: (nameKeys: string[]) => Promise<boolean[]>,

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
    batchUnwrap: (nameKeys: string[], to?: string) => Promise<ContractTransaction>,

    /**
     * @dev Wrap the 2LD domain name
     * 
     * @param nameKeys An array of domain nameKeys
     * @param to The address to receive the wrapped tokens
     * 
     * @return ContractTransaction
     */
    batchWrap: (nameKeys: string[], to?: string) => Promise<ContractTransaction>

    /**
     * @dev Approve the base implementation contract (Old ENS contract) to spend the token
     * 
     * @return ContractTransaction | null if already approved
     */
    approveBaseImplementationDomains: () => Promise<ContractTransaction | null>,

    /**
     * @dev Approve the name wrapper contract to spend the token
     * 
     * @return ContractTransaction | null if already approved
     */
    approveNameWrapperDomains: () => Promise<ContractTransaction | null>

}

export type IBatchENSManagerInit = (
    provider: providers.JsonRpcSigner
) => IBatchENSManager;
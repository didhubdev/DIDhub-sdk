import { BigNumberish, ContractTransactionResponse, JsonRpcSigner } from 'ethers';

export interface IBatchTransfer {
    /**
     * @dev Get the fixed fee of the contract interaction
     * 
     * @return BigNumberish The fee in wei
     */
    getFixedFee: () => Promise<BigNumberish>,
    
    /**
     * @dev Check if the user has enough balance to pay for the fixed fee
     * 
     * @returns boolean
     */
    checkFee: () => Promise<boolean>,

    /**
     * @dev Check if the user has approved the contract to spend the tokens
     * 
     * @param domainInfos An array of domains to be transferred
     * 
     * @returns boolean[]
     */
    batchCheckApproval: (domainInfos: string[]) => Promise<boolean[]>,

    /**
     * @dev Approve a type of domain to be transferred 
     * 
     * @param domainInfo A domain to be transferred
     * 
     * @returns ContractTransaction | null if the user has already approved the contract
     */
    approveDomain: (domainInfo: string) => Promise<ContractTransactionResponse | null>,

    /**
     * @dev Approve all domains to be transferred
     * 
     * @param domainInfos An array of domains to be transferred
     */
    approveAllDomains: (domainInfos: string[]) => Promise<void>,

    /**
     * @dev Transfer tokens to a particular address
     * 
     * @param domainInfos An array of domains to be transferred
     * @param to The address to receive the tokens
     * 
     * @returns ContractTransaction
     */
    batchTransfer: (domainInfos: string[], to: string) => Promise<ContractTransactionResponse>,

    estimateGas: {
        approveDomain: (domainInfo: string) => Promise<bigint>,
        approveAllDomains: (domainInfos: string[]) => Promise<bigint>,
        batchTransfer: (domainInfos: string[], to: string) => Promise<bigint>
    }
}

export type IBatchTransferInit = (
    signer: JsonRpcSigner
) => IBatchTransfer;
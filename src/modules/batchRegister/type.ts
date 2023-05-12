import { BatchRegister } from 'contracts/didhub';
import { CommitmentInfoStructOutput, DomainPriceInfoStruct, RegistrationInfoStruct } from 'contracts/didhub/BSC/BatchRegister';
import { BigNumber, ContractTransaction } from 'ethers';

export interface IDomainInfo {
    collectionInfo: string
    nameKey: string;
    duration?: string;
}

export interface IRegistrationData {
    requests: RegistrationInfoStruct[];
    paymentToken: string;
    paymentMax: string;
}

export interface IBatchRegister {
    
    batchCheckCommitment: (domains: IDomainInfo[]) => Promise<number[]>;

    /**
     * @dev get the commitment hashes for the domains, grouped by project
     * 
     * @param domains The list of domains to check
     * @returns The list of commitment hashes grouped by project
     */
    batchMakeCommitments: (domains: IDomainInfo[]) => Promise<CommitmentInfoStructOutput[]>;
    
    /**
     * @dev commit the domains
     * 
     * @param commitmentInfos The list of commitment infos, it is the output of batchMakeCommitments function
     * 
     * @return The transaction object
     */
    batchCommit: (commitmentInfos: CommitmentInfoStructOutput[]) => Promise<ContractTransaction>;
    batchCheckAvailability: (domains: IDomainInfo[]) => Promise<boolean[]>;
    getTotalPrice: (domains: IDomainInfo[], paymentToken: string) => Promise<BigNumber[]>;
    getIndividualPrice: (domains: IDomainInfo[], paymentToken: string) => Promise<DomainPriceInfoStruct[]>;
    getPriceWithMargin: (domains: IDomainInfo[], paymentToken: string, margin: number) => Promise<IRegistrationData>;
    checkPurchaseConditions: (
        domains: IDomainInfo[],
        paymentToken: string,
        paymentMax: string
    ) => Promise<boolean>;
    approveERC20Tokens: (
        paymentToken: string,
        paymentMax: string
    ) => Promise<ContractTransaction | null>;
    batchRegister: (
        requests: RegistrationInfoStruct[],
        paymentToken: string,
        paymentMax: string
    ) => Promise<ContractTransaction>;
}

export type IBatchRegistration = (
    batchRegisterContract: BatchRegister,
    secret: string
) => IBatchRegister;
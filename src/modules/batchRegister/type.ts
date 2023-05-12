import { BatchRegister } from 'contracts/didhub';
import { CommitmentInfoStructOutput, DomainPriceInfoStruct, RegistrationInfoStruct } from 'contracts/didhub/BSC/BatchRegister';
import { BigNumber, ContractTransaction } from 'ethers';
import { batchRegistration } from '.';

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
    batchMakeCommitments: (domains: IDomainInfo[]) => Promise<CommitmentInfoStructOutput[]>;
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

export type batchRegistration = (
    batchRegisterContract: BatchRegister,
    secret: string
) => IBatchRegister;
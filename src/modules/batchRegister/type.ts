import { CommitmentInfoStructOutput } from 'contracts/didhub/BSC/BatchRegister';
import { BigNumber, ContractTransaction } from 'ethers';

export interface IDomainInfo {
    collectionInfo: string
    nameKey: string;
    duration?: string;
}

export interface IBatchRegister {
    batchCheckCommitment: (domains: IDomainInfo[]) => Promise<number[]>;
    batchMakeCommitments: (domains: IDomainInfo[]) => Promise<CommitmentInfoStructOutput[]>;
    batchCommit: (commitmentInfos: CommitmentInfoStructOutput[]) => Promise<ContractTransaction>;
    batchCheckAvailability: (domains: IDomainInfo[]) => Promise<number[]>;
    getTotalPrice: (domains: IDomainInfo[]) => Promise<BigNumber[]>;
}
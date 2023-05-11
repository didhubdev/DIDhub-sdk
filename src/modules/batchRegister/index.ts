import { BatchRegister } from './../../contracts/didhub';
import { CommitmentInfoStructOutput } from 'contracts/didhub/BSC/BatchRegister';
import { IDomainInfo } from './type';
import { getPriceRequest, getRegistrationInfo } from 'utils';
import { BigNumber, BytesLike, ContractTransaction } from 'ethers';

export const batchRegistration = (
    batchRegisterContract: BatchRegister,
) => {

    const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

    const batchMakeCommitments = async (
        domains: IDomainInfo[]
    ): Promise<CommitmentInfoStructOutput[]> => {

        const registrationInfo  = getRegistrationInfo(
            domains,
            await batchRegisterContract.signer.getAddress(),
            secret
        )
        
        const commitments = await batchRegisterContract.batchMakeCommitment(
            registrationInfo
        );
        return commitments;
    }

    const batchCommit = async (
        commitmentInfos: CommitmentInfoStructOutput[]
    ): Promise<ContractTransaction> => {
        const tx = await batchRegisterContract.batchCommit(
            commitmentInfos
        );
        return tx;
    }

    /**
     * @dev check the status of the commitment
     *  0: not exist, requires commit
     *  1: available but before minCommitmentAge
     *  2: available and after minCommitmentAge and before maxCommitmentAge, or does not require commitment
     *  3: available and after maxCommitmentAge, requires commit
     * 
     */
    const batchCheckCommitment = async (
        domains: IDomainInfo[]
    ): Promise<number[]> => {
        const commitmentInfos = await batchMakeCommitments(domains);
        let commitmentStatusResult = await batchRegisterContract.batchCheckCommitments(commitmentInfos);
        
        // unwrap results to list
        let commitmentStatus: number[] = [];
        domains.forEach(d=>{
            let project = d.collectionInfo.split(":").slice(1).join(":");
            commitmentStatus.push(commitmentStatusResult.filter(c=>c.project==project)[0].status.shift());
        })
        return commitmentStatus;
    }

    const batchCheckAvailability = async (
        domains: IDomainInfo[]
    ): Promise<boolean[]> => {
        const registrationInfo  = getRegistrationInfo(
            domains,
            await batchRegisterContract.signer.getAddress(),
            secret
        );

        const availabilityStatusResult = await batchRegisterContract.batchCheckAvailability(
            registrationInfo
        );

        // unwrap results to list
        let availabilityStatus: boolean[] = [];
        domains.forEach(d=>{
            let project = d.collectionInfo.split(":").slice(1).join(":");
            availabilityStatus.push(availabilityStatusResult.filter(c=>c.project==project)[0].status.shift());
        })
        return availabilityStatus;
    }

    /**
     * 
     * @dev get total price of the domains summed by project
     * 
     * @param domains 
     * @returns 
     */
    const getTotalPrice = async (
        domains: IDomainInfo[],
        paymentToken: string
    ): Promise<BigNumber[]> => {
        const priceRequestStructs  = getPriceRequest(domains);
        const totalPrice = await batchRegisterContract.callStatic.getTotalPrice(
            priceRequestStructs,
            paymentToken
        );
        return totalPrice;
    }

    const getIndividualPrice = async (
        domain: IDomainInfo
    ) => {
        
    }



    // const batchRegister = async (
    //     domains: IDomainInfo[],
    //     paymentToken: string,
    //     paymentMax: string
    // ): Promise<ContractTransaction> => {

    // }

    return {
        batchCheckCommitment: batchCheckCommitment,
        batchMakeCommitments: batchMakeCommitments,
        batchCommit: batchCommit,
        batchCheckAvailability: batchCheckAvailability,
        getTotalPrice: getTotalPrice
    }

}
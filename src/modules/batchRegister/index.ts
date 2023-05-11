import { BatchRegister } from './../../contracts/didhub';
import { ERC20__factory } from 'contracts/tokens';
import { CommitmentInfoStructOutput, DomainPriceInfoStruct, RegistrationInfoStruct } from 'contracts/didhub/BSC/BatchRegister';
import { IBatchRegister, IDomainInfo } from './type';
import { getPriceRequest, getRegistrationInfo, unwrapResult } from 'utils';
import { BigNumber, ContractTransaction } from 'ethers';
import { ZERO_ADDRESS } from 'config';

export const batchRegistration = (
    batchRegisterContract: BatchRegister,
    secret: string
): IBatchRegister => {

    /**
     * @dev get the commitment hashes for the domains, grouped by project
     * 
     * @param domains The list of domains to check
     * 
     * @returns The list of commitment hashes grouped by project
     * 
     */
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

    /**
     * @dev commit the domains
     * 
     * @param commitmentInfos The list of commitment infos, it is the output of batchMakeCommitments function
     * 
     * @return The transaction object
     */
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
     * @param domains The list of domains to check
     * @returns The list of status of the domains
     */
    const batchCheckCommitment = async (
        domains: IDomainInfo[]
    ): Promise<number[]> => {
        const commitmentInfos = await batchMakeCommitments(domains);
        let commitmentStatusResult = await batchRegisterContract.batchCheckCommitments(commitmentInfos);
        
        // unwrap results to list
        let commitmentStatus: number[] = unwrapResult(domains, commitmentStatusResult, "status");
        return commitmentStatus;
    }

    /**
     * @dev check the availability status of the domain
     * 
     * @param domains The list of domains to check
     * 
     * @returns The list of status of the domains
     */
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
        let availabilityStatus: boolean[] = unwrapResult(domains, availabilityStatusResult, "status");
        return availabilityStatus;
    }

    /**
     * 
     * @dev get total price of the domains summed by project
     * 
     * @param domains The list of domains to check
     * @returns The list of total price of the domains summed by project
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

    /**
     * @dev get individual price of the domains
     * 
     * @param domains The list of domains to check
     * 
     * @returns The list of individual price of each domains
     */
    const getIndividualPrice = async (
        domains: IDomainInfo[]
    ): Promise<DomainPriceInfoStruct[]> => {
        const priceRequestStructs  = getPriceRequest(domains);
        const individualPrices = await batchRegisterContract.callStatic.getIndividualPrices(
            priceRequestStructs
        );
        const priceList: DomainPriceInfoStruct[] = unwrapResult(domains, individualPrices, "prices");
        return priceList;
    }

    /**
     * @dev Get the price data necessary for batch register with a specific margin apply
     * 
     * @param domains The list of domains to check 
     * @params paymentToken The address of the payment token
     * @params margin The margin to apply in percentage, i.e. 3 for 3%
     * 
     * @returns The price data necessary for batch register
     */
    const getPriceWithMargin = async (
        domains: IDomainInfo[],
        paymentToken: string,
        margin: number
    ): Promise<any> => {
        const owner = await batchRegisterContract.signer.getAddress();
        let requests = getRegistrationInfo(domains, owner, secret);
        const totalPrices = await getTotalPrice(domains, paymentToken);

        // enrich request
        requests = requests.map((r, i) => {
            r.paymentToken = paymentToken;
            r.paymentMax = totalPrices[i].mul(100 + margin).div(100);
            return r;
        });
        const totalPrice = totalPrices.map(p=>p.mul(100 + margin).div(100)).reduce((a,b)=>a.add(b));
        return {
            requests: requests,
            paymentToken: paymentToken,
            paymentMax: totalPrice.toString
        }
    }

    /**
     * @dev Check whether the domain is ready for registration. Examine based on the token balance of the signer, 
     * whether the token approval is sufficient, the commitment status, and the availability status
     * 
     * @param domains The list of domains to register
     * @param paymentToken The address of the payment token
     * @param paymentMax The maximum amount of payment token to be used, for registering all domains
     */
    const checkPurchaseConditions = async (
        domains: IDomainInfo[],
        paymentToken: string,
        paymentMax: string
    ): Promise<boolean> => {
        const signerAddress = await batchRegisterContract.signer.getAddress();

        // check total price and balance is sufficient
        if (paymentToken == ZERO_ADDRESS) {
            const ethBalance = await batchRegisterContract.signer.getBalance();
            if (ethBalance.lt(paymentMax)) {
                throw new Error("Insufficient ETH balance");
            }
        } else {
            // attach ERC20 token to contract and create an instance of ERC20 contract
            const erc20Contract = new ERC20__factory(batchRegisterContract.signer).attach(paymentToken);
            const erc20Balance = await erc20Contract.balanceOf(signerAddress);
            if (erc20Balance.lt(paymentMax)) {
                throw new Error("Insufficient ERC20 balance");
            };
            // check Allowance
            const allowance = await erc20Contract.allowance(signerAddress, batchRegisterContract.address);
            if (allowance.lt(paymentMax)) {
                throw new Error("Insufficient ERC20 allowance");
            }
        }

        // check is commited
        const commitmentStatus = await batchCheckCommitment(domains);
        commitmentStatus.forEach((status, index) => {
            if (status != 2) {
                throw new Error(`Domain ${domains[index].nameKey} is not committed`);
            }
        });

        // check is available
        const availabilityStatus = await batchCheckAvailability(domains);
        availabilityStatus.forEach((status, index) => {
            if (!status) {
                throw new Error(`Domain ${domains[index].nameKey} is not available`);
            }
        });
        return true;
    }

    /**
     * @dev Approve the ERC20 token for the contract to use, return null if the approval is not needed
     * 
     * @param paymentToken The address of the payment token
     * @param paymentMax The approval needed
     * @return The transaction object or null if the approval is not needed
     */
    const approveERC20Tokens = async (
        paymentToken: string,
        paymentMax: string
    ): Promise<ContractTransaction | null> => {
        const signerAddress = await batchRegisterContract.signer.getAddress();
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = new ERC20__factory(batchRegisterContract.signer).attach(paymentToken);
        const allowance = await erc20Contract.allowance(signerAddress, batchRegisterContract.address);
        if (allowance.lt(paymentMax)) {
            const tx = await erc20Contract.approve(batchRegisterContract.address, paymentMax);
            return tx;
        }
        return null;
    }

    /**
     * @dev Batch register the domains. Use the getPriceWithMargin function to get the necessary data before calling this function
     * 
     * @param requests The information to register the domains
     * @returns The transaction object
     */
    const batchRegister = async (
        requests: RegistrationInfoStruct[],
        paymentToken: string,
        paymentMax: string
    ): Promise<ContractTransaction> => {
        if (paymentToken == ZERO_ADDRESS) {
            const tx = await batchRegisterContract.batchRegister(requests, {value: paymentMax});
            return tx;
        } else {
            const tx = await batchRegisterContract.batchRegisterERC20(requests, paymentToken, paymentMax);
            return tx;
        }
    }

    return {
        batchCheckCommitment: batchCheckCommitment,
        batchMakeCommitments: batchMakeCommitments,
        batchCommit: batchCommit,
        batchCheckAvailability: batchCheckAvailability,
        getTotalPrice: getTotalPrice,
        getPriceWithMargin: getPriceWithMargin,
        getIndividualPrice: getIndividualPrice,
        checkPurchaseConditions: checkPurchaseConditions,
        approveERC20Tokens: approveERC20Tokens,
        batchRegister: batchRegister
    }

}
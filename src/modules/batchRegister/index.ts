import { getBatchRegisterContract } from '../../contracts/didhub';
import { ERC20__factory } from '../../contracts/tokens';
import { Data } from '../../contracts/didhub/batchRegister/BatchRegister';
import { IBatchRegister, IDomainInfo, IBatchRegistration, IPurchaseCheck, ITokenInfo, IRenewData, IRegistrationData, IRenewCheck } from './type';
import { getPriceRequest, getRegistrationInfo, unwrapResult, getRenewInfo } from '../../utils';
import { BigNumberish, ContractTransactionResponse, JsonRpcSigner, ethers } from 'ethers';
import { ZERO_ADDRESS } from '../../config';
import { executeTransaction } from '../../error';

export const batchRegistration: IBatchRegistration = (
    signer:  JsonRpcSigner,
    secret: string
): IBatchRegister => {;

    const batchMakeCommitments = async (
        domains: IDomainInfo[]
    ): Promise<Data.CommitmentInfoStruct[]> => {

        const batchRegisterContract = await getBatchRegisterContract(signer);
        const registrationInfo  = getRegistrationInfo(
            domains,
            await signer.getAddress(),
            secret
        )
        
        const commitments = await batchRegisterContract.batchMakeCommitment(
            registrationInfo
        );

        // clone to prevent error on modifying read only object
        let commitmentsClone: Data.CommitmentInfoStruct[] = commitments.map(c => {
            return {
                project: c.project,
                commitments: [...c.commitments]
            }
        });

        return commitmentsClone;
    }

    const batchCommit = async (
        commitmentInfos: Data.CommitmentInfoStruct[]
    ): Promise<ContractTransactionResponse> => {
        
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const tx = await executeTransaction(
            batchRegisterContract.batchCommit(
                commitmentInfos
            )
        )
        return tx;
    }

    const batchCheckCommitment = async (
        domains: IDomainInfo[]
    ): Promise<number[]> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        let commitmentInfos  = await batchMakeCommitments(domains);       

        let commitmentStatusResult: Data.CommitmentStatusResponseStruct[] = await batchRegisterContract.batchCheckCommitments(commitmentInfos);
        
        // unwrap results to list
        let commitmentStatus = unwrapResult(domains, commitmentStatusResult, "status");
        let commitmentStatusNumber = commitmentStatus.map(s => Number(s));
        return commitmentStatusNumber;
    }

    const batchCheckAvailability = async (
        domains: IDomainInfo[]
    ): Promise<boolean[]> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const registrationInfo = getRegistrationInfo(
            domains,
            await signer.getAddress(),
            secret
        );

        const availabilityStatusResult: Data.AvalibilityStatusResponseStruct[] = await batchRegisterContract.batchCheckAvailability(
            registrationInfo
        );

        // unwrap results to list
        let availabilityStatus: boolean[] = unwrapResult(domains, availabilityStatusResult, "status");
        return availabilityStatus;
    }

    const getTotalPrice = async (
        domains: IDomainInfo[],
        paymentToken: string
    ): Promise<bigint[]> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const priceRequestStructs  = getPriceRequest(domains);
        let totalPrice = await batchRegisterContract.getTotalPrice.staticCall(
            priceRequestStructs,
            paymentToken
        );
        
        // add contract fee to total price
        let fee = await batchRegisterContract.feeBasisPt();
        totalPrice = totalPrice.map(p=>p * (fee + BigInt(10000)) / BigInt(10000));
        
        return totalPrice;
    }

    const getIndividualPrice = async (
        domains: IDomainInfo[]
    ): Promise<Data.DomainPriceInfoStruct[]> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const priceRequestStructs  = getPriceRequest(domains);
        const individualPrices: Data.ProjectPriceResponseStruct[] = await batchRegisterContract.getIndividualPrices.staticCall(
            priceRequestStructs
        );
        const priceList: Data.DomainPriceInfoStruct[] = unwrapResult(domains, individualPrices, "prices");
        return priceList;
    }

    const getPriceWithMargin = async (
        domains: IDomainInfo[],
        paymentToken: string,
        margin: number
    ): Promise<IRegistrationData> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const owner = await signer.getAddress();
        let requests = getRegistrationInfo(domains, owner, secret);
        const totalPrices = await getTotalPrice(domains, paymentToken);

        // get didhub fee
        const didhubFee = await batchRegisterContract.feeBasisPt();

        // enrich request
        requests = requests.map((r, i) => {
            r.paymentToken = paymentToken;
            r.paymentMax = totalPrices[i] * BigInt(100 + margin) / BigInt(100);
            return r;
        });
        const totalPrice = totalPrices.map(p=>p * BigInt(100 + margin) / BigInt(100)).reduce((a,b)=>a + b);
        const totalPriceWithFee = totalPrice * (didhubFee + BigInt(10000)) / BigInt(10000);
        return {
            requests: requests,
            paymentToken: paymentToken,
            paymentMax: totalPriceWithFee
        }
    }

    const getRenewPriceWithMargin = async (
        domains: IDomainInfo[],
        paymentToken: string,
        margin: number
    ): Promise<IRenewData> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const owner = await signer.getAddress();
        let requests = getRenewInfo(domains, owner, secret);
        const totalPrices = await getTotalPrice(domains, paymentToken);

        // get didhub fee
        const didhubFee = await batchRegisterContract.feeBasisPt();

        // enrich request
        requests = requests.map((r, i) => {
            r.paymentToken = paymentToken;
            r.paymentMax = totalPrices[i] * BigInt(100 + margin) / BigInt(100);
            return r;
        });
        const totalPrice = totalPrices.map(p=>p * BigInt(100 + margin) / BigInt(100)).reduce((a,b)=>a + b);
        const totalPriceWithFee = totalPrice * (didhubFee + BigInt(10000)) / BigInt(10000);
        return {
            requests: requests,
            paymentToken: paymentToken,
            paymentMax: totalPriceWithFee
        }
    }

    const checkPurchaseConditions = async (
        domains: IDomainInfo[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<IPurchaseCheck> => {
        
        let errorList: string[] = [];
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const signerAddress = await signer.getAddress();

        // check total price and balance is sufficient
        if (paymentToken == ZERO_ADDRESS) {
            const ethBalance = await signer.provider.getBalance(signer.address);
            if (ethBalance < ethers.toBigInt(paymentMax)) {
                errorList.push("Insufficient ETH balance");
            }
        } else {
            // attach ERC20 token to contract and create an instance of ERC20 contract
            const erc20Contract = ERC20__factory.connect(paymentToken, signer);
            const erc20Balance = await erc20Contract.balanceOf(signerAddress);
            if (erc20Balance < ethers.toBigInt(paymentMax)) {
                errorList.push("Insufficient ERC20 balance");
            };
            // check Allowance
            const allowance = await erc20Contract.allowance(signerAddress, await batchRegisterContract.getAddress());
            if (allowance < ethers.toBigInt(paymentMax)) {
                errorList.push("Insufficient ERC20 allowance");
            }
        }   

        // check is commited
        const commitmentStatus = await batchCheckCommitment(domains);
        commitmentStatus.forEach((status, index) => {
            if (status == 0) {
                errorList.push(`Domain ${domains[index].nameKey} is not committed`);
            } else if (status == 1) {
                errorList.push(`Domain ${domains[index].nameKey} is commited, but not yet effective`);
            } else if (status == 3) {
                errorList.push(`Domain ${domains[index].nameKey} is expired. Please commit again`);
            }
        });

        // check is available
        const availabilityStatus = await batchCheckAvailability(domains);
        availabilityStatus.forEach((status, index) => {
            if (!status) {
                errorList.push(`Domain ${domains[index].nameKey} is not available`);
            }
        });

        return {
            success: errorList.length == 0,
            errors: errorList,
            commitmentStatus: commitmentStatus,
            availabilityStatus: availabilityStatus
        };
    }

    const checkRenewConditions = async (
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<IRenewCheck> => {
        
        let errorList: string[] = [];
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const signerAddress = await signer.getAddress();

        // check total price and balance is sufficient
        if (paymentToken == ZERO_ADDRESS) {
            const ethBalance = await signer.provider.getBalance(signer.address);
            if (ethBalance < ethers.toBigInt(paymentMax)) {
                errorList.push("Insufficient ETH balance");
            }
        } else {
            // attach ERC20 token to contract and create an instance of ERC20 contract
            const erc20Contract = ERC20__factory.connect(paymentToken, signer);
            const erc20Balance = await erc20Contract.balanceOf(signerAddress);
            if (erc20Balance < ethers.toBigInt(paymentMax)) {
                errorList.push("Insufficient ERC20 balance");
            };
            // check Allowance
            const allowance = await erc20Contract.allowance(signerAddress, await batchRegisterContract.getAddress());
            if (allowance < ethers.toBigInt(paymentMax)) {
                errorList.push("Insufficient ERC20 allowance");
            }
        }

        return {
            success: errorList.length == 0,
            errors: errorList
        };
    }

    const getERC20Balance = async (
        paymentToken: string
    ): Promise<bigint> => {
        const signerAddress = await signer.getAddress();
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = ERC20__factory.connect(paymentToken, signer);
        const erc20Balance = await erc20Contract.balanceOf(signerAddress);
        return erc20Balance;
    }

    const approveERC20Tokens = async (
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<ContractTransactionResponse | null> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const signerAddress = await signer.getAddress();
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = ERC20__factory.connect(paymentToken, signer);
        const allowance = await erc20Contract.allowance(signerAddress, await batchRegisterContract.getAddress());
        if (allowance < ethers.toBigInt(paymentMax)) {
            const tx = await executeTransaction(
                erc20Contract.approve(await batchRegisterContract.getAddress(), paymentMax)
            );
            return tx;
        }
        return null;
    }

    const batchRegister = async (
        requests: Data.RegistrationInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<ContractTransactionResponse> => {

        const batchRegisterContract = await getBatchRegisterContract(signer);
        if (paymentToken == ZERO_ADDRESS) {
            const tx = await executeTransaction(
                batchRegisterContract.batchRegister(requests, {value: paymentMax})
            );
            return tx;
        } else {
            const tx = await executeTransaction(
                batchRegisterContract.batchRegisterERC20(requests, paymentToken, paymentMax)
            );
            return tx;
        }
    }

    const batchRenew = async (
        requests: Data.RenewInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<ContractTransactionResponse> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        if (paymentToken == ZERO_ADDRESS) {
            const tx = await executeTransaction(
                batchRegisterContract.batchRenew(requests, {
                    value: paymentMax,
                })
            );
            return tx;
        } else {
            const tx = await executeTransaction(
                batchRegisterContract.batchRenewERC20(requests, paymentToken, paymentMax)
            );
            return tx;
        }
    }

    const getSupportedTokens = async (chain: string): Promise<ITokenInfo[]> => {
        switch (chain) {
            case "Ethereum":
                return [
                    {
                        name: "ETH",
                        address: "ETHEREUM:0x0000000000000000000000000000000000000000",
                        decimals: 18
                    }
                ]
            case "BNB Chain":
                return [
                    {
                        name: "BNB",
                        address: "BNB:0x0000000000000000000000000000000000000000",
                        decimals: 18
                    },
                    {
                        name: "WBNB",
                        address: "BNB:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                        decimals: 18,
                        isNativeWrappedToken: true
                    },
                    {
                        name: "USDC",
                        address: "BNB:0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
                        decimals: 18
                    }
                ]
            case "Polygon":
                return [
                    {
                        name: "POL",
                        address: "POLYGON:0x0000000000000000000000000000000000000000",
                        decimals: 18
                    }
                ]
            case "Arbitrum":
                return [
                    {
                        name: "ETH",
                        address: "ARBITRUM:0x0000000000000000000000000000000000000000",
                        decimals: 18
                    },
                    {
                        name: "WETH",
                        address: "ARBITRUM:0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
                        decimals: 18,
                        isNativeWrappedToken: true
                    },
                    {
                        name: "USDC",
                        address: "ARBITRUM:0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
                        decimals: 6
                    }
                ]
            case "Avalanche":
                return [
                    {
                        name: "AVAX",
                        address: "AVALANCHE:0x0000000000000000000000000000000000000000",
                        decimals: 18
                    }
                ]
            default:
                return [];
        }
    }

    // GAS ESTIMATION ===========================================================
    
    const batchCommitEstimateGasFee = async(
        commitmentInfos: Data.CommitmentInfoStruct[]
    ): Promise<bigint> => { 
        let numberOfCommits = 0;
        commitmentInfos.forEach(c => {
            numberOfCommits += c.commitments.length;
        });
        try {
            const estimatedGas = BigInt(31000) * BigInt(numberOfCommits);
            const feeData = await signer.provider.getFeeData();  
            return estimatedGas * feeData.gasPrice!;
        } catch {
            return BigInt(0);
        }
    }

    const batchRegisterEstimateGasFee = async (
        requests: Data.RegistrationInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<bigint> => {
        const feeData = await signer.provider.getFeeData();
        let numberOfDomains = 0;
        requests.forEach(r => {
            numberOfDomains += r.domains.length;
        });
        try {
            let estimatedGas = BigInt(250000) * BigInt(numberOfDomains);
            return estimatedGas * feeData.gasPrice!;
        } catch {
            return BigInt(0);
        }
    }

    const batchRenewEstimateGasFee = async (
        requests: Data.RenewInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<bigint> => {
        const feeData = await signer.provider.getFeeData();
        let numberOfDomains = 0;
        requests.forEach(r => {
            numberOfDomains += r.domains.length;
        });
        try {
            let estimatedGas = BigInt(120000) * BigInt(numberOfDomains);
            return estimatedGas * feeData.gasPrice!;
        } catch {
            return BigInt(0);
        }
    }

    const approveERC20TokensEstimateGasFee = async (
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<bigint> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const network = await signer.provider.getFeeData();
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = ERC20__factory.connect(paymentToken, signer);
        try {
            const estimatedGas = await erc20Contract.approve.estimateGas(await batchRegisterContract.getAddress(), paymentMax);
            return estimatedGas * network.gasPrice!;
        } catch {
            return BigInt(0);
        }
    }

    const didhubFee = async (): Promise<number> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const basisPt = await batchRegisterContract.feeBasisPt();
        return Number(basisPt) / 100;
    }

    return {
        batchCheckCommitment: batchCheckCommitment,
        batchMakeCommitments: batchMakeCommitments,
        batchCommit: batchCommit,
        batchCheckAvailability: batchCheckAvailability,
        getTotalPrice: getTotalPrice,
        getPriceWithMargin: getPriceWithMargin,
        getRenewPriceWithMargin: getRenewPriceWithMargin,
        getIndividualPrice: getIndividualPrice,
        checkPurchaseConditions: checkPurchaseConditions,
        checkRenewConditions: checkRenewConditions,
        getERC20Balance: getERC20Balance,
        approveERC20Tokens: approveERC20Tokens,
        batchRegister: batchRegister,
        batchRenew: batchRenew,
        getSupportedTokens: getSupportedTokens,
        didhubFee: didhubFee,
        estimateGas: {
            batchCommit: batchCommitEstimateGasFee,
            batchRegister: batchRegisterEstimateGasFee,
            batchRenew: batchRenewEstimateGasFee,
            approveERC20Tokens: approveERC20TokensEstimateGasFee
        }
    }

}
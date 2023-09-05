import { getBatchRegisterContract } from '../../contracts/didhub';
import { ERC20__factory } from '../../contracts/tokens';
import { CommitmentInfoStructOutput, DomainPriceInfoStruct, RegistrationInfoStruct, RenewInfoStruct } from '../../contracts/didhub/batchRegister/BatchRegister';
import { IBatchRegister, IDomainInfo, IBatchRegistration, IPurchaseCheck, ITokenInfo, IRenewData, IRegistrationData, IRenewCheck } from './type';
import { getPriceRequest, getRegistrationInfo, unwrapResult, getRenewInfo } from '../../utils';
import { BigNumber, BigNumberish, ContractTransaction, providers } from 'ethers';
import { ZERO_ADDRESS } from '../../config';

export const batchRegistration: IBatchRegistration = (
    provider: providers.JsonRpcSigner,
    secret: string
): IBatchRegister => {;

    const batchMakeCommitments = async (
        domains: IDomainInfo[]
    ): Promise<CommitmentInfoStructOutput[]> => {

        const batchRegisterContract = await getBatchRegisterContract(provider);
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
        
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const estimatedGas = await batchRegisterContract.estimateGas.batchCommit(commitmentInfos);
        const tx = await batchRegisterContract.batchCommit(
            commitmentInfos,
            {gasLimit: estimatedGas.mul(120).div(100)}
        );
        return tx;
    }

    const batchCheckCommitment = async (
        domains: IDomainInfo[]
    ): Promise<number[]> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        let commitmentInfos = await batchMakeCommitments(domains);       
        let commitmentStatusResult = await batchRegisterContract.batchCheckCommitments(commitmentInfos);
        
        // unwrap results to list
        let commitmentStatus: number[] = unwrapResult(domains, commitmentStatusResult, "status");
        return commitmentStatus;
    }

    const batchCheckAvailability = async (
        domains: IDomainInfo[]
    ): Promise<boolean[]> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const registrationInfo = getRegistrationInfo(
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

    const getTotalPrice = async (
        domains: IDomainInfo[],
        paymentToken: string
    ): Promise<BigNumber[]> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const priceRequestStructs  = getPriceRequest(domains);
        const totalPrice = await batchRegisterContract.callStatic.getTotalPrice(
            priceRequestStructs,
            paymentToken
        );
        return totalPrice;
    }

    const getIndividualPrice = async (
        domains: IDomainInfo[]
    ): Promise<DomainPriceInfoStruct[]> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const priceRequestStructs  = getPriceRequest(domains);
        const individualPrices = await batchRegisterContract.callStatic.getIndividualPrices(
            priceRequestStructs
        );
        const priceList: DomainPriceInfoStruct[] = unwrapResult(domains, individualPrices, "prices");
        return priceList;
    }

    const getPriceWithMargin = async (
        domains: IDomainInfo[],
        paymentToken: string,
        margin: number
    ): Promise<IRegistrationData> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const owner = await batchRegisterContract.signer.getAddress();
        let requests = getRegistrationInfo(domains, owner, secret);
        const totalPrices = await getTotalPrice(domains, paymentToken);

        // get didhub fee
        const didhubFee = await batchRegisterContract.feeBasisPt();

        // enrich request
        requests = requests.map((r, i) => {
            r.paymentToken = paymentToken;
            r.paymentMax = totalPrices[i].mul(100 + margin).div(100);
            return r;
        });
        const totalPrice = totalPrices.map(p=>p.mul(100 + margin).div(100)).reduce((a,b)=>a.add(b));
        const totalPriceWithFee = totalPrice.mul(didhubFee.toNumber()+10000).div(10000);
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
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const owner = await batchRegisterContract.signer.getAddress();
        let requests = getRenewInfo(domains, owner, secret);
        const totalPrices = await getTotalPrice(domains, paymentToken);

        // get didhub fee
        const didhubFee = await batchRegisterContract.feeBasisPt();

        // enrich request
        requests = requests.map((r, i) => {
            r.paymentToken = paymentToken;
            r.paymentMax = totalPrices[i].mul(100 + margin).div(100);
            return r;
        });
        const totalPrice = totalPrices.map(p=>p.mul(100 + margin).div(100)).reduce((a,b)=>a.add(b));
        const totalPriceWithFee = totalPrice.mul(didhubFee.toNumber()+10000).div(10000);
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
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const signerAddress = await batchRegisterContract.signer.getAddress();

        // check total price and balance is sufficient
        if (paymentToken == ZERO_ADDRESS) {
            const ethBalance = await batchRegisterContract.signer.getBalance();
            if (ethBalance.lt(paymentMax)) {
                errorList.push("Insufficient ETH balance");
            }
        } else {
            // attach ERC20 token to contract and create an instance of ERC20 contract
            const erc20Contract = new ERC20__factory(batchRegisterContract.signer).attach(paymentToken);
            const erc20Balance = await erc20Contract.balanceOf(signerAddress);
            if (erc20Balance.lt(paymentMax)) {
                errorList.push("Insufficient ERC20 balance");
            };
            // check Allowance
            const allowance = await erc20Contract.allowance(signerAddress, batchRegisterContract.address);
            if (allowance.lt(paymentMax)) {
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
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const signerAddress = await batchRegisterContract.signer.getAddress();

        // check total price and balance is sufficient
        if (paymentToken == ZERO_ADDRESS) {
            const ethBalance = await batchRegisterContract.signer.getBalance();
            if (ethBalance.lt(paymentMax)) {
                errorList.push("Insufficient ETH balance");
            }
        } else {
            // attach ERC20 token to contract and create an instance of ERC20 contract
            const erc20Contract = new ERC20__factory(batchRegisterContract.signer).attach(paymentToken);
            const erc20Balance = await erc20Contract.balanceOf(signerAddress);
            if (erc20Balance.lt(paymentMax)) {
                errorList.push("Insufficient ERC20 balance");
            };
            // check Allowance
            const allowance = await erc20Contract.allowance(signerAddress, batchRegisterContract.address);
            if (allowance.lt(paymentMax)) {
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
    ): Promise<BigNumberish> => {
        const signerAddress = await provider.getAddress();
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = new ERC20__factory(provider).attach(paymentToken);
        const erc20Balance = await erc20Contract.balanceOf(signerAddress);
        return erc20Balance;
    }

    const approveERC20Tokens = async (
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<ContractTransaction | null> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const signerAddress = await provider.getAddress();
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = new ERC20__factory(batchRegisterContract.signer).attach(paymentToken);
        const allowance = await erc20Contract.allowance(signerAddress, batchRegisterContract.address);
        if (allowance.lt(paymentMax)) {
            const tx = await erc20Contract.approve(batchRegisterContract.address, paymentMax);
            return tx;
        }
        return null;
    }

    const batchRegister = async (
        requests: RegistrationInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<ContractTransaction> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        if (paymentToken == ZERO_ADDRESS) {
            const estimatedGas = await batchRegisterContract.estimateGas.batchRegister(requests, {value: paymentMax});
            const tx = await batchRegisterContract.batchRegister(requests, {
                value: paymentMax,
                gasLimit: estimatedGas.mul(120).div(100)
            });
            return tx;
        } else {
            const estimatedGas = await batchRegisterContract.estimateGas.batchRegisterERC20(requests, paymentToken, paymentMax);
            const tx = await batchRegisterContract.batchRegisterERC20(requests, paymentToken, paymentMax, {
                gasLimit: estimatedGas.mul(120).div(100)
            });
            return tx;
        }
    }

    const batchRenew = async (
        requests: RenewInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<ContractTransaction> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        if (paymentToken == ZERO_ADDRESS) {
            const estimatedGas = await batchRegisterContract.estimateGas.batchRenew(requests, {value: paymentMax});
            const tx = await batchRegisterContract.batchRenew(requests, {
                value: paymentMax,
                gasLimit: estimatedGas.mul(120).div(100)
            });
            return tx;
        } else {
            const estimatedGas = await batchRegisterContract.estimateGas.batchRenewERC20(requests, paymentToken, paymentMax);
            const tx = await batchRegisterContract.batchRenewERC20(requests, paymentToken, paymentMax, {
                gasLimit: estimatedGas.mul(120).div(100)
            });
            return tx;
        }
    }

    const getSupportedTokens = async (): Promise<ITokenInfo[]> => {
        // check current chain
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const chainId = await batchRegisterContract.signer.getChainId();
        switch (chainId) {
            case 56:
                return [
                    {
                        name: "BNB",
                        address: "0x0000000000000000000000000000000000000000",
                        decimals: 18
                    },
                    {
                        name: "WBNB",
                        address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
                        decimals: 18
                    },
                    {
                        name: "USDC",
                        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
                        decimals: 18
                    }
                ]
            case 250:
                return [
                    {
                        name: "FTM",
                        address: "0x0000000000000000000000000000000000000000",
                        decimals: 18
                    },
                    {
                        name: "WFTM",
                        address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
                        decimals: 18
                    }
                ]
            case 42161:
                return [
                    {
                        name: "ETH",
                        address: "0x0000000000000000000000000000000000000000",
                        decimals: 18
                    },
                    {
                        name: "WETH",
                        address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
                        decimals: 18
                    },
                    {
                        name: "USDC",
                        address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
                        decimals: 6
                    }
                ]
            default:
                throw Error("Chain not supported");
        }
    }

    // GAS ESTIMATION ===========================================================
    
    const batchCommitEstimateGasFee = async(
        commitmentInfos: CommitmentInfoStructOutput[]
    ): Promise<BigNumber> => { 
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const estimatedGas = await batchRegisterContract.estimateGas.batchCommit(commitmentInfos);
        const gasPrice = await provider.getGasPrice();  
        return estimatedGas.mul(gasPrice);
    }

    const batchRegisterEstimateGasFee = async (
        requests: RegistrationInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<BigNumber> => {
        const gasPrice = await provider.getGasPrice();
        const batchRegisterContract = await getBatchRegisterContract(provider);
        let estimatedGas = paymentToken == ZERO_ADDRESS ?
            await batchRegisterContract.estimateGas.batchRegister(requests, {value: paymentMax}) :
            await batchRegisterContract.estimateGas.batchRegisterERC20(requests, paymentToken, paymentMax);
        return estimatedGas.mul(gasPrice);
    }

    const batchRenewEstimateGasFee = async (
        requests: RenewInfoStruct[],
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<BigNumber> => {
        const gasPrice = await provider.getGasPrice();
        const batchRegisterContract = await getBatchRegisterContract(provider);
        let estimatedGas = paymentToken == ZERO_ADDRESS ? 
            await batchRegisterContract.estimateGas.batchRenew(requests, {value: paymentMax}): 
            await batchRegisterContract.estimateGas.batchRenewERC20(requests, paymentToken, paymentMax);
        return estimatedGas.mul(gasPrice);
    }

    const approveERC20TokensEstimateGasFee = async (
        paymentToken: string,
        paymentMax: BigNumberish
    ): Promise<BigNumber> => {
        const batchRegisterContract = await getBatchRegisterContract(provider);
        const gasPrice = await provider.getGasPrice();
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = new ERC20__factory(batchRegisterContract.signer).attach(paymentToken);
        const estimatedGas = await erc20Contract.estimateGas.approve(batchRegisterContract.address, paymentMax);
        return estimatedGas.mul(gasPrice);
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
        estimateGas: {
            batchCommit: batchCommitEstimateGasFee,
            batchRegister: batchRegisterEstimateGasFee,
            batchRenew: batchRenewEstimateGasFee,
            approveERC20Tokens: approveERC20TokensEstimateGasFee
        }
    }

}
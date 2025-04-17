import { ERC20__factory, ERC721__factory, getBatchRegisterContract, getWrapTokenContract } from "../../contracts";
import { BigNumberish, ContractTransactionResponse, JsonRpcSigner} from "ethers";
import { IUtils } from "./type";
import { MockERC20 } from "contracts/tokens/ERC20";
import { executeTransaction } from "../../error";

export const utils = (signer: JsonRpcSigner) => {

    const getERC20Balance = async (
        paymentToken: string
    ): Promise<bigint> => {
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const signerAddress = await signer.getAddress();
        const erc20Contract = ERC20__factory.connect(paymentToken, signer);
        const erc20Balance = await erc20Contract.balanceOf(signerAddress);
        return erc20Balance;
    }
    
    const approveERC20Tokens = async (
        tokenContract: string,
        to: string,
        amount: BigNumberish
    ): Promise<ContractTransactionResponse | null> => {
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const signerAddress = await signer.getAddress();
        const erc20Contract: MockERC20 = ERC20__factory.connect(tokenContract, signer);
        const allowance = await erc20Contract.allowance(signerAddress, to);
        if (allowance < BigInt(amount)) {
            const tx = await executeTransaction(
                erc20Contract.approve(to, amount)
            );
            return tx;
        }
        return null;
    }

    const approveAllERC721or1155Tokens = async (
        tokenContract: string,
        operator: string
    ): Promise<ContractTransactionResponse | null> => {
        const signerAddress = await signer.getAddress();
        const erc721Contract = ERC721__factory.connect(tokenContract, signer);
        const isApprovedForAll = await erc721Contract.isApprovedForAll(signerAddress, operator);
        if (!isApprovedForAll) {
            const tx = await executeTransaction(
                erc721Contract.setApprovalForAll(operator, true)
            );
            return tx;
        }
        return null;
    }
    
    const isERC721Owner = async (
        tokenContract: string,
        tokenId: BigNumberish
    ): Promise<boolean> => {
        const signerAddress = await signer.getAddress();
        const erc721Contract = ERC721__factory.connect(tokenContract, signer);
        try {
            const owner = await erc721Contract.ownerOf(tokenId);
            return owner === signerAddress;
        } catch (e) {
            return false;
        }
    }

    const wrapEth2Weth = async (
        amount: BigNumberish
    ): Promise<ContractTransactionResponse> => {
        const wethContract = await getWrapTokenContract(signer);
        const tx = await wethContract.deposit({
            value: amount
        });
        return tx;
    }

    const unwrapWeth2Eth = async (
        amount: BigNumberish
    ): Promise<ContractTransactionResponse> => {
        const wethContract = await getWrapTokenContract(signer);
        const tx = await wethContract.withdraw(amount);
        return tx;
    }

    // estimate Gas
    const approveERC20TokensEstimateGas = async (
        tokenContract: string,
        to: string,
        amount: BigNumberish
    ): Promise<bigint> => {
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = ERC20__factory.connect(tokenContract, signer);
        const price = await signer.provider.getFeeData().then(fee => fee.gasPrice);
        try {
            const estimatedGas = await erc20Contract.approve.estimateGas(to, amount);
            return estimatedGas * price!;    
        } catch {
            return BigInt(0);
        }
    }

    const approveAllERC721or1155TokensEstimateGas = async (
        tokenContract: string,
        operator: string
    ): Promise<bigint> => {
        const erc721Contract = ERC721__factory.connect(tokenContract, signer);
        const price = await signer.provider.getFeeData().then(fee => fee.gasPrice);
        try {
            const estimatedGas = await erc721Contract.setApprovalForAll.estimateGas(operator, true);
            return estimatedGas * price!;    
        } catch {
            return BigInt(0);
        }
    }
    
    const wrapEth2WethEstimateGas = async (
        amount: BigNumberish
    ): Promise<bigint> => {
        const wethContract = await getWrapTokenContract(signer);
        const price = await signer.provider.getFeeData().then(fee => fee.gasPrice);
        try {
            const estimatedGas = await wethContract.deposit.estimateGas({
                value: amount
            });
            return estimatedGas * price!;
        } catch {
            return BigInt(0);
        }
    }

    const unwrapWeth2EthEstimateGas = async (
        amount: BigNumberish
    ): Promise<bigint> => {
        const wethContract = await getWrapTokenContract(signer);
        const price = await signer.provider.getFeeData().then(fee => fee.gasPrice);
        try {
            const estimatedGas = await wethContract.withdraw.estimateGas(amount);
            return estimatedGas * price!;
        } catch {
            return BigInt(0);
        }
    }

    // service fee
    const getRegisterServiceFee = async (): Promise<number> => {
        const batchRegisterContract = await getBatchRegisterContract(signer);
        const serviceFee = await batchRegisterContract.feeBasisPt();
        const serviceFeePercentage = Number(serviceFee) / 100.0;
        return serviceFeePercentage;
    }


    const utils: IUtils = {
        getERC20Balance: getERC20Balance,
        approveERC20Tokens: approveERC20Tokens,
        approveAllERC721or1155Tokens: approveAllERC721or1155Tokens,
        isERC721Owner: isERC721Owner,
        wrapEth2Weth: wrapEth2Weth,
        unwrapWeth2Eth: unwrapWeth2Eth,
        estimateGas: {
            approveERC20Tokens: approveERC20TokensEstimateGas,
            approveAllERC721or1155Tokens: approveAllERC721or1155TokensEstimateGas,
            wrapEth2Weth: wrapEth2WethEstimateGas,
            unwrapWeth2Eth: unwrapWeth2EthEstimateGas
        },
        serviceFee: {
            register: getRegisterServiceFee
        }
    }

    return utils;

}
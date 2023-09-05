import { ERC20__factory, ERC721__factory } from "../../contracts";
import { BigNumber, BigNumberish, ContractTransaction, providers} from "ethers";
import { IUtils } from "./type";

export const utils = (provider: providers.JsonRpcSigner) => {

    const getERC20Balance = async (
        paymentToken: string
    ): Promise<BigNumberish> => {
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const signerAddress = await provider.getAddress();
        const erc20Contract = new ERC20__factory(provider).attach(paymentToken);
        const erc20Balance = await erc20Contract.balanceOf(signerAddress);
        return erc20Balance;
    }
    
    const approveERC20Tokens = async (
        tokenContract: string,
        to: string,
        amount: BigNumberish
    ): Promise<ContractTransaction | null> => {
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const signerAddress = await provider.getAddress();
        const erc20Contract = new ERC20__factory(provider).attach(tokenContract);
        const allowance = await erc20Contract.allowance(signerAddress, to);
        if (allowance.lt(amount)) {
            const tx = await erc20Contract.approve(to, amount);
            return tx;
        }
        return null;
    }

    const approveAllERC721or1155Tokens = async (
        tokenContract: string,
        operator: string
    ): Promise<ContractTransaction | null> => {
        const signerAddress = await provider.getAddress();
        const erc721Contract = new ERC721__factory(provider).attach(tokenContract);
        const isApprovedForAll = await erc721Contract.isApprovedForAll(signerAddress, operator);
        if (!isApprovedForAll) {
            const tx = await erc721Contract.setApprovalForAll(operator, true);
            return tx;
        }
        return null;
    }
    
    const isERC721Owner = async (
        tokenContract: string,
        tokenId: BigNumberish
    ): Promise<boolean> => {
        const signerAddress = await provider.getAddress();
        const erc721Contract = new ERC721__factory(provider).attach(tokenContract);
        try {
            const owner = await erc721Contract.ownerOf(tokenId);
            return owner === signerAddress;
        } catch (e) {
            return false;
        }
    }

    // estimate Gas
    const approveERC20TokensEstimateGas = async (
        tokenContract: string,
        to: string,
        amount: BigNumberish
    ): Promise<BigNumber> => {
        // attach ERC20 token to contract and create an instance of ERC20 contract
        const erc20Contract = new ERC20__factory(provider).attach(tokenContract);
        const price = await provider.getGasPrice();
        const estimatedGas = await erc20Contract.estimateGas.approve(to, amount);
        return estimatedGas.mul(price);
    }

    const approveAllERC721or1155TokensEstimateGas = async (
        tokenContract: string,
        operator: string
    ): Promise<BigNumber> => {
        const erc721Contract = new ERC721__factory(provider).attach(tokenContract);
        const price = await provider.getGasPrice();
        const estimatedGas = await erc721Contract.estimateGas.setApprovalForAll(operator, true);
        return estimatedGas.mul(price);
    }
    
    const utils: IUtils = {
        getERC20Balance: getERC20Balance,
        approveERC20Tokens: approveERC20Tokens,
        approveAllERC721or1155Tokens: approveAllERC721or1155Tokens,
        isERC721Owner: isERC721Owner,
        estimateGas: {
            approveERC20Tokens: approveERC20TokensEstimateGas,
            approveAllERC721or1155Tokens: approveAllERC721or1155TokensEstimateGas   
        }
    }

    return utils;

}
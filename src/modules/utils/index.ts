import { ERC20__factory } from "../../contracts";
import { BigNumberish, ContractTransaction, providers} from "ethers";
import { IUtils } from "./type";


const utils = (provider: providers.JsonRpcSigner) => {

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
    
    const utils: IUtils = {
        getERC20Balance: getERC20Balance,
        approveERC20Tokens: approveERC20Tokens
    }

    return utils;

}
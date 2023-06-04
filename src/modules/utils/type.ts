import { BigNumberish, ContractTransaction, providers } from "ethers";

export interface IUtils {

    getERC20Balance: (
        provider: providers.JsonRpcSigner,
        paymentToken: string
    ) => Promise<BigNumberish>

    approveERC20Tokens: (
        provider: providers.JsonRpcSigner,
        tokenContract: string,
        to: string,
        amount: BigNumberish
    ) => Promise<ContractTransaction | null>
}

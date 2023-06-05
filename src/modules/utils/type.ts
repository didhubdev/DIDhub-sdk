import { BigNumberish, ContractTransaction, providers } from "ethers";

export interface IUtils {

    getERC20Balance: (
        paymentToken: string
    ) => Promise<BigNumberish>

    approveERC20Tokens: (
        tokenContract: string,
        to: string,
        amount: BigNumberish
    ) => Promise<ContractTransaction | null>
}

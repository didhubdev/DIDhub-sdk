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

    /**
     * @dev Approve all ERC721 or ERC1155 tokens to be spent by the operator
     * 
     * @param tokenContract the NFT contract
     * @param operator the address that can spend the token
     * 
     * @returns ContractTransaction or null if already approved
     */
    approveAllERC721or1155Tokens: (
        tokenContract: string,
        operator: string
    ) => Promise<ContractTransaction | null>
}

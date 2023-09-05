import { BigNumber, BigNumberish, ContractTransaction } from "ethers";


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

    /**
     * @dev Check if the signer is the owner of the token
     * 
     * @param tokenContract token contract address
     * @param tokenId token id
     * 
     * @returns boolean true if the signer is the owner of the token, false if not or if token has expired
     */
    isERC721Owner: (
        tokenContract: string,
        tokenId: BigNumberish
    ) => Promise<boolean>;
    
    /**
     * @dev Estimate Gas for the transaction
     */
    estimateGas: {
        approveERC20Tokens: (
            tokenContract: string,
            to: string,
            amount: BigNumberish
        ) => Promise<BigNumber>
        
        approveAllERC721or1155Tokens: (
            tokenContract: string,
            operator: string
        ) => Promise<BigNumber>
    }
}

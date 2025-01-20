import { BigNumberish, ContractTransactionResponse } from "ethers";


export interface IUtils {

    getERC20Balance: (
        paymentToken: string
    ) => Promise<BigNumberish>

    approveERC20Tokens: (
        tokenContract: string,
        to: string,
        amount: BigNumberish
    ) => Promise<ContractTransactionResponse | null>

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
    ) => Promise<ContractTransactionResponse | null>

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
     * @dev Wrap ETH to WETH
     * 
     * @param amount amount of ETH to wrap
     * 
     * @returns ContractTransaction
     */
    wrapEth2Weth: (
        amount: BigNumberish
    ) => Promise<ContractTransactionResponse>;

    /**
     * @dev Unwrap WETH to ETH
     * 
     * @param amount amount of WETH to unwrap
     * 
     * @returns ContractTransaction
     */
    unwrapWeth2Eth: (
        amount: BigNumberish
    ) => Promise<ContractTransactionResponse>;

    /**
     * @dev Estimate Gas for the transaction
     */
    estimateGas: {
        approveERC20Tokens: (
            tokenContract: string,
            to: string,
            amount: BigNumberish
        ) => Promise<bigint>
        
        approveAllERC721or1155Tokens: (
            tokenContract: string,
            operator: string
        ) => Promise<bigint>

        wrapEth2Weth: (
            amount: BigNumberish
        ) => Promise<bigint>
        
        unwrapWeth2Eth: (
            amount: BigNumberish
        ) => Promise<bigint>
    },

    serviceFee: {

        register: () => Promise<number>
        
    }
}

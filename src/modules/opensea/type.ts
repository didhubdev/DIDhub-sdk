import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { IFTStruct, SwapInfoStruct, INFTStruct, AdvancedOrderStruct } from "../../contracts/didhub/batchPurchase/BatchPurchase";
import { BigNumberish, ContractTransaction, providers } from "ethers";

export enum ItemType {
    NATIVE = 0,
    ERC20 = 1,
    ERC721 = 2,
    ERC1155 = 3,
    ERC721_WITH_CRITERIA = 4,
    ERC1155_WITH_CRITERIA = 5,
}

/**
 * @note This is the response from the DIDHUB backend that makes call to Opensea on behalf of the user
 * 
 * @param code 1 for success, 0 for failure
 * @param message the message from the DIDHUB backend
 */
export interface IDIDhubResponse {
    code: number,
    message: string
}

export type IOpenseaInit = (
    seaportSDK: InstanceType<typeof SeaportSDK>,
    provider: providers.JsonRpcSigner
) => IOpensea;

export interface IOrderRequestData {
    domainInfo: string,
    paymentToken: string,
    paymentAmount: string,
    endInDays: number
}

export interface IOpensea {
    
    /**
     * @note This function is used list a domain on Opensea
     * 
     * @param domainInfo a string in the format of {chain}:{contractAddress}:{tokenId}
     * @param paymentToken the address of the payment token
     * @param paymentAmount the amount of payment token to list
     * @param endInDays the number of days that this listing will remain valid
     * @returns response object with code and message
     */
    listDomain: (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string,
        endInDays: number
    ) => Promise<IDIDhubResponse>
    
    /**
     * @note This function is used to list a list of domains on Opensea 
     * 
     * @param orderRequestData a list of order request data
     * @returns response object with code and message
     */
    bulkListDomain: (
        orderRequestData: IOrderRequestData[]  
    ) => Promise<IDIDhubResponse>

    /**
     * @note This function is used to make an offer on a domain on Opensea
     *  
     * @param domainInfo a string in the format of {chain}:{contractAddress}:{tokenId}
     * @param paymentToken the address of the payment token
     * @param paymentAmount the amount of payment token to list
     * @param endInDays the number of days that this offer will remain valid
     * 
     * @returns response object with code and message
     */
    offerDomain: (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string,
        endInDays: number
    ) => Promise<IDIDhubResponse>,

        /**
     * @note This function is used to offer a list of domains on Opensea 
     * 
     * @param orderRequestData a list of order request data
     * @returns response object with code and message
     */
    bulkOfferDomain: (
        orderRequestData: IOrderRequestData[]  
    ) => Promise<IDIDhubResponse>

    /**
     * @note This function is used to fulfill a listing on Opensea
     * 
     * @param orderId the order id of the listing
     * 
     * @returns contract transaction
     */
    fulfillListing: (
        orderId: string
    ) => Promise<ContractTransaction>,

    /**
     * @note This function is used to fulfill an offer on Opensea
     * 
     * @param orderId the order id of the offer
     * 
     * @returns contract transaction
     */
    fulfillOffer: (
        orderId: string
    ) => Promise<ContractTransaction>,
    
    /**
     * 
     * @param orderIds the order ids of the listings
     * 
     * @returns advanced orders
     */
    getAdvancedListingOrders: (
        orderIds: string[]
    ) => Promise<AdvancedOrderStruct[]>,

    /**
     * 
     * @param orderIds the order ids of the offers
     * 
     * @returns advanced orders
     */
    getAdvancedOfferOrders: (
        orderIds: string[]
    ) => Promise<AdvancedOrderStruct[]>,

    /**
     * @note This function is used to get the information necessary to complete a swap operation before fulfilling order on opensea
     * 
     * @param advancedOrders the order info fetched from Opensea
     * @param paymentToken the address of the payment token
     * @param margin the margin to add to the payment amount (usually set below 0.3%)
     * 
     * @returns swap info
     * 
     */
    getSwapInfo: (
        advancedOrders: AdvancedOrderStruct[],
        paymentToken: string,
        margin: number
    ) => Promise<SwapInfoStruct>,

    /**
     * @note This function is used to fulfill a list of listings on Opensea
     * 
     * @param param advancedOrders the order info fetched from Opensea
     * @param swapInfo the swap info returned from getSwapInfo. This can be obtained by calling getSwapInfo function
     * 
     * @retrybs contract transaction
     */
    fulfillListings: (
        advancedOrders: AdvancedOrderStruct[],
        swapInfo: SwapInfoStruct
    ) => Promise<ContractTransaction>,

        /**
     * @note This function is used to fulfill a list of offers on Opensea
     * 
     * @param advancedOrders the order info fetched from Opensea
     * @param fulfillmentItems the list of items required to fulfill the order 
     * 
     * @retrybs contract transaction
     */
    fulfillOffers: (
        advancedOrders: AdvancedOrderStruct[],
        fulfillmentItems: INFTStruct[]
    ) => Promise<ContractTransaction>,
    
    /**
     * @note This function is used to cancel a list of listings on Opensea
     * 
     * @returns contract transaction
     */
    cancelOrders: (
        orderIds: string[]
    ) => Promise<ContractTransaction>,

    /**
     * @note This function checks whether the opensea conduit have been given approvel to use the given tokens
     * 
     * @param tokens a list of Non-fungible tokens to check. Each token denoted as a tokenContract and tokenId
     * 
     * @returns a list of boolean indicating whether the token is approved
     */
    batchCheckApprovalERC721orERC1155: (
        tokens: INFTStruct[]
    ) => Promise<boolean[]>
    
    /**
     * @note This function checks whether the opensea conduit have been given approvel to use the given tokens
     * 
     * @param tokens a list of Fungible tokens to check. Each token denoted as a tokenContract and amount
     * 
     * @returns a list of boolean indicating whether the token is approved
     */
    batchCheckApprovalERC20: (
        tokens: IFTStruct[]
    ) => Promise<boolean[]>

    /**
     * @note This function is used to approve a list of ERC721 or ERC1155 tokens on Opensea conduit address
     * 
     * @param tokenAddress the address of the token
     * 
     * @returns contract transaction or null if the token is already approved
     */
    approveERC721orERC1155Tokens: (
        tokenAddress: string
    ) => Promise<ContractTransaction | null>,

    /**
     * @note This function is used to approve a list of ERC20 tokens on Opensea conduit address
     * 
     * @param tokenAddress the address of the token
     * @param amount the amount of token to approve
     * 
     * @returns contract transaction or null if the token is already approved
     */
    approveERC20Tokens: (
        tokenAddress: string,
        amount: BigNumberish
    ) => Promise<ContractTransaction | null>
}
import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { Data, IFTStruct, INFTStruct, AdvancedOrderStruct } from "../../contracts/didhub/batchPurchase/BatchPurchase";
import { BigNumberish, BytesLike, ContractTransaction, ContractTransactionResponse, JsonRpcSigner, TransactionResponse } from "ethers";
import { OrderWithCounter } from "@opensea/seaport-js/lib/types";
import { ITokenInfo } from "modules/batchRegister/type";

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
    provider: JsonRpcSigner,
    environment: "production" | "dev"
) => IOpensea;

export interface IOrderRequestData {
    domainInfo: string,
    paymentToken: string,
    paymentAmount: string,
    endInSeconds: number
}

export interface IOrderData {
    orderWithCounter: OrderWithCounter,
    extraData: BytesLike
}

export interface IOpensea {
    
    /**
     * @note This function is used list a domain on Opensea
     * 
     * @param domainInfo a string in the format of {chain}:{contractAddress}:{tokenId}
     * @param paymentToken the address of the payment token
     * @param paymentAmount the amount of payment token to list
     * @param endInSeconds the number of seconds that this listing will remain valid
     * @returns response object with code and message
     */
    listDomain: (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string,
        endInSeconds: number
    ) => Promise<IDIDhubResponse>
    
    /**
     * @note This function is used to list a list of domains on Opensea 
     * 
     * @param orderRequestData a list of order request data
     * @param platform the platform to list the domains on. Default is Opensea
     * @returns response object with code and message
     */
    bulkListDomain: (
        orderRequestData: IOrderRequestData[],
        platform: "DIDhub" | "OpenSea"
    ) => Promise<IDIDhubResponse>

    /**
     * @note This function is used to make an offer on a domain on Opensea
     *  
     * @param domainInfo a string in the format of {chain}:{contractAddress}:{tokenId}
     * @param paymentToken the address of the payment token
     * @param paymentAmount the amount of payment token to list
     * @param endInSeconds the number of seconds that this offer will remain valid
     * 
     * @returns response object with code and message
     */
    offerDomain: (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string,
        endInSeconds: number
    ) => Promise<IDIDhubResponse>,

        /**
     * @note This function is used to offer a list of domains on Opensea 
     * 
     * @param orderRequestData a list of order request data
     * @param platform the platform to offer the domains on. Default is Opensea
     * @returns response object with code and message
     */
    bulkOfferDomain: (
        orderRequestData: IOrderRequestData[]  ,
        platform: "DIDhub" | "OpenSea"
    ) => Promise<IDIDhubResponse>

    /**
     * @note This function is used to fulfill a listing on Opensea
     * 
     * @param orderId the order id of the listing
     * @param receipent an optional receipent address, if none is given will default to the signer address
     * 
     * @returns contract transaction
     */
    fulfillListing: (
        orderId: string,
        receipent?: string
    ) => Promise<ContractTransaction>,

    /**
     * @note This function is used to fulfill an offer on Opensea
     * 
     * @param orderId the order id of the offer
     * @param receipent an optional receipent address, if none is given will default to the signer address
     * 
     * @returns contract transaction
     */
    fulfillOffer: (
        orderId: string,
        receipent?: string
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
    ) => Promise<Data.SwapInfoStruct>,

    /**
     * @note This function is used to fulfill a list of listings on Opensea
     * 
     * @param param advancedOrders the order info fetched from Opensea
     * @param swapInfo the swap info returned from getSwapInfo. This can be obtained by calling getSwapInfo function
     * @param receipent an optional receipent address, if none is given will default to the signer address 
     * 
     * @retrybs contract transaction
     */
    fulfillListings: (
        advancedOrders: AdvancedOrderStruct[],
        swapInfo: Data.SwapInfoStruct,
        receipent?: string
    ) => Promise<ContractTransactionResponse>,

        /**
     * @note This function is used to fulfill a list of offers on Opensea
     * 
     * @param advancedOrders the order info fetched from Opensea
     * @param receipent an optional receipent address, if none is given will default to the signer address
     * 
     * @retrybs contract transaction
     */
    fulfillOffers: (
        advancedOrders: AdvancedOrderStruct[],
        receipent?: string
    ) => Promise<ContractTransactionResponse>,
    
    /**
     * @note This function is used to get the order ids of the invalid listings
     * 
     * @param domainInfo a string in the format of {chain}:{contractAddress}:{tokenId}  
     * @param paymentToken the address of the payment token of the new listing
     * @param paymentAmount the amount of payment token to list of the new listing, in string
     * @returns order ids of the invalid listings
     */
    getInvalidListings: (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string
    ) => Promise<string[]>,


    /**
     * @note This function is used to get the order ids of the invalid offers
     * 
     * @param domainInfo a string in the format of {chain}:{contractAddress}:{tokenId}  
     * @param paymentToken the address of the payment token of the new listing
     * @param paymentAmount the amount of payment token to list of the new listing, in string
     * @returns order ids of the invalid offers
     */
    getInvalidOffers: (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string
    ) => Promise<string[]>,

    /**
     * @note This function is used to cancel listings that are unwanted on Opensea
     * 
     * @param domainInfo a string in the format of {chain}:{contractAddress}:{tokenId}  
     * @param paymentToken the address of the payment token of the new listing
     * @param paymentAmount the amount of payment token to list of the new listing, in string
     */
    cancelInvalidListings : (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string
    ) => Promise<TransactionResponse | null>,

    /**
     * @note This function is used to cancel offers that are unwanted on Opensea
     * 
     * @param domainInfo a string in the format of {chain}:{contractAddress}:{tokenId}  
     * @param paymentToken the address of the payment token of the new offer
     * @param paymentAmount the amount of payment token to list of the new offer, in string
     */
    cancelInvalidOffers : (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string
    ) => Promise<TransactionResponse | null>,

    /**
     * @note This function is used to cancel a list of listings on Opensea
     * 
     * @returns contract transaction
     */
    cancelOrders: (
        orderIds: string[]
    ) => Promise<TransactionResponse>,

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
    ) => Promise<ContractTransactionResponse | null>,

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
    ) => Promise<ContractTransactionResponse | null>

    /**
     * @note This function is used to check whether a list of orders are still valid. Orders 
     * could be invalid if the listing has been cancelled or accepted, or the token has been 
     * transferred to another address
     * 
     * @param orderIds a list of orderId to check
     * @returns boolean array indicating whether the corresponding order is valid
     */
    checkOrderValidity: (
        orderIds: string[]
    ) => Promise<boolean[]>

    /**
     * @dev This function is used to get the opensea supported offer tokens for a given chain
     * 
     * @param chain the chain to get the supported tokens
     * @returns a list of supported tokens
     */
    getSupportedOfferTokens: (chain: string) => Promise<ITokenInfo[]>

    /**
     * @dev This function is used to get the opensea supported listing tokens for a given chain
     * 
     * @param chain the chain to get the supported tokens
     * @returns a list of supported tokens
     */
    getSupportedListingTokens: (chain: string) => Promise<ITokenInfo[]>

    /**
     * @dev This function is used to get the opensea supported marketplaces for a given chain
     * 
     * @param chain the chain to get the supported tokens
     * @returns a list of supported tokens
     */
    getSupportedMarketplaces: (chain: string) => Promise<string[]>

    /**
     * 
     * @param project the project name
     * @returns creator fee of the project
     */
    getCreatorFee: (project: string) => Promise<number>


    /**
     * 
     * @returns the opensea fee
     */
    getOpenseaFee: () => Promise<number>
    
    estimateGas: {
        approveERC20Tokens: (
            tokenAddress: string,
            amount: BigNumberish
        ) => Promise<bigint>,
        approveERC721orERC1155Tokens: (
            tokenAddress: string
        ) => Promise<bigint>,
        fulfillListings: (
            listingLength: number
        ) => Promise<bigint>,
        fulfillOffers: (
            offerLength: number
        ) => Promise<bigint>
    }
}
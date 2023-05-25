import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { OrderWithCounter } from "@opensea/seaport-js/lib/types";
import { ContractTransaction, Signer } from "ethers";

export enum ItemType {
    NATIVE = 0,
    ERC20 = 1,
    ERC721 = 2,
    ERC1155 = 3,
    ERC721_WITH_CRITERIA = 4,
    ERC1155_WITH_CRITERIA = 5,
}

export type IOpenseaInit = (
    seaportSDK: InstanceType<typeof SeaportSDK>,
    signer: Signer
) => IOpensea;

export interface IOpensea {
    listDomain: (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string,
        endInDays: number
    ) => Promise<OrderWithCounter>
    
    offerDomain: (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string,
        endInDays: number
    ) => Promise<OrderWithCounter>,

    fulfillListing: (
        orderId: string
    ) => Promise<ContractTransaction>,

    fulfillOffer: (
        orderId: string
    ) => Promise<ContractTransaction>,

}
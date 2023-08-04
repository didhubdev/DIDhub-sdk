import { BigNumberish } from "ethers";

export interface IDomainInfo {
    collectionInfo: string
    nameKey: string;
    duration?: BigNumberish;
}

export interface INFTToken {
    tokenAddress: string
    tokenId: string
}
import { BigNumberish } from "ethers";

export interface IDomainInfo {
    collectionInfo: string
    nameKey: string;
    duration?: BigNumberish;
}
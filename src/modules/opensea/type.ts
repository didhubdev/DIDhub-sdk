import { Seaport } from "contracts/seaport";
import { BigNumber } from "ethers";

export type OfferItem = {
    itemType: number;
    token: string;
    identifierOrCriteria: BigNumber;
    startAmount: BigNumber;
    endAmount: BigNumber;
};

export type ConsiderationItem = {
    itemType: number;
    token: string;
    identifierOrCriteria: BigNumber;
    startAmount: BigNumber;
    endAmount: BigNumber;
    recipient: string;
};

export type OrderParameters = {
    offerer: string;
    zone: string;
    offer: OfferItem[];
    consideration: ConsiderationItem[];
    orderType: number;
    startTime: string | BigNumber | number;
    endTime: string | BigNumber | number;
    zoneHash: string;
    salt: string;
    conduitKey: string;
    totalOriginalConsiderationItems: string | BigNumber | number;
  };
  
export type OrderComponents = Omit<
        OrderParameters,
        "totalOriginalConsiderationItems"
    > & {
    counter: BigNumber;
};

export const orderType = {
    OrderComponents: [
        { name: "offerer", type: "address" },
        { name: "zone", type: "address" },
        { name: "offer", type: "OfferItem[]" },
        { name: "consideration", type: "ConsiderationItem[]" },
        { name: "orderType", type: "uint8" },
        { name: "startTime", type: "uint256" },
        { name: "endTime", type: "uint256" },
        { name: "zoneHash", type: "bytes32" },
        { name: "salt", type: "uint256" },
        { name: "conduitKey", type: "bytes32" },
        { name: "counter", type: "uint256" },
    ],
    OfferItem: [
        { name: "itemType", type: "uint8" },
        { name: "token", type: "address" },
        { name: "identifierOrCriteria", type: "uint256" },
        { name: "startAmount", type: "uint256" },
        { name: "endAmount", type: "uint256" },
    ],
    ConsiderationItem: [
        { name: "itemType", type: "uint8" },
        { name: "token", type: "address" },
        { name: "identifierOrCriteria", type: "uint256" },
        { name: "startAmount", type: "uint256" },
        { name: "endAmount", type: "uint256" },
        { name: "recipient", type: "address" },
    ],
};

export type IOpenseaInit = (
    seaportContract: Seaport
) => IOpensea;

export interface IOpensea {

}
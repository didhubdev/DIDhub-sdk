import { BatchRegister } from "./BSC/BatchRegister";
import { BatchRegister__factory } from "./BSC/BatchRegister__factory";
import { CONTRACTS } from "../../config";
import { providers } from "ethers";
import { BatchPurchase } from "./batchPurchase/BatchPurchase";
import { BatchPurchase__factory } from "./batchPurchase/BatchPurchase__factory";

export const getBatchRegisterContract = async (provider: providers.JsonRpcSigner): Promise<BatchRegister> => {
    // initialise batch register contract of a particular network
    const chainId = await provider.getChainId();
    switch (chainId) {
        case 56:
            return (new BatchRegister__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.BNB
            );
        case 421611:
            return (new BatchRegister__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.ARBITRUM
            );
        default:
            throw Error(`Chain ${chainId} is not supported`);
    }
}

export const getBatchPurchaseContract = async (provider: providers.JsonRpcSigner): Promise<BatchPurchase> => {
    // initialise batch register contract of a particular network
    const chainId = await provider.getChainId();
    switch (chainId) {
        case 137:
            return (new BatchPurchase__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_PURCHASE.POLYGON
            );
        case 56: 
            return (new BatchPurchase__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_PURCHASE.BNB
            );
        default:
            throw Error(`Chain ${chainId} is not supported`);
    }
}

export { BatchRegister } from "./BSC/BatchRegister";
export { BatchPurchase } from "./batchPurchase/BatchPurchase";

export { BatchRegister__factory } from './BSC/BatchRegister__factory';
export { BatchPurchase__factory } from './batchPurchase/BatchPurchase__factory';
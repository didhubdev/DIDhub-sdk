import { BatchRegister } from "./batchRegister/BatchRegister";
import { BatchRegister__factory } from "./batchRegister/BatchRegister__factory";
import { CONTRACTS } from "../../config";
import { providers } from "ethers";
import { BatchPurchase } from "./batchPurchase/BatchPurchase";
import { BatchPurchase__factory } from "./batchPurchase/BatchPurchase__factory";
import { BatchTransfer } from "./batchTransfer/BatchTransfer";
import { BatchTransfer__factory } from "./batchTransfer/BatchTransfer__factory";
import { BatchENSManager } from "./batchENSManager/BatchENSManager";
import { BatchENSManager__factory } from "./batchENSManager/BatchENSManager__factory";

export const getBatchRegisterContract = async (provider: providers.JsonRpcSigner): Promise<BatchRegister> => {
    // initialise batch register contract of a particular network
    const chainId = await provider.getChainId();
    switch (chainId) {
        case 1: 
            return (new BatchRegister__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.ETHEREUM
            );
        case 5:
            return (new BatchRegister__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.GOERLI
            );
        case 56:
            return (new BatchRegister__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.BNB
            );
        case 250:
            return (new BatchRegister__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.FANTOM
            );
        case 42161:
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
        case 42161:
            return (new BatchPurchase__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_PURCHASE.ARBITRUM
            );
        default:
            throw Error(`Chain ${chainId} is not supported`);
    }
}

export const getBatchTransferContract = async (provider: providers.JsonRpcSigner): Promise<BatchTransfer> => {
    // initialise batch register contract of a particular network
    const chainId = await provider.getChainId();
    switch (chainId) {
        case 137:
            return (new BatchTransfer__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_TRANSFER.POLYGON
            );
        case 56:
            return (new BatchTransfer__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_TRANSFER.BNB
            );
        case 42161:
            return (new BatchTransfer__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_TRANSFER.ARBITRUM
            );
        default:
            throw Error(`Chain ${chainId} is not supported`);
    }
}

export const getBatchENSManagerContract = async (provider: providers.JsonRpcSigner): Promise<BatchENSManager> => {
    // initialise batch register contract of a particular network
    const chainId = await provider.getChainId();
    switch (chainId) {
        case 137:
            return (new BatchENSManager__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_ENS_MANAGER.ETHEREUM
            );
        default:
            throw Error(`Chain ${chainId} is not supported`);
    }
}

export { BatchRegister } from "./batchRegister/BatchRegister";
export { BatchPurchase } from "./batchPurchase/BatchPurchase";
export { BatchTransfer } from "./batchTransfer/BatchTransfer";
export { BatchENSManager } from "./batchENSManager/BatchENSManager";

export { BatchRegister__factory } from './batchRegister/BatchRegister__factory';
export { BatchPurchase__factory } from './batchPurchase/BatchPurchase__factory';
export { BatchTransfer__factory } from './batchTransfer/BatchTransfer__factory';
export { BatchENSManager__factory } from './batchENSManager/BatchENSManager__factory';
import { BatchRegister } from "./batchRegister/BatchRegister";
import { BatchRegister__factory } from "./batchRegister/BatchRegister__factory";
import { CONTRACTS } from "../../config";
import { BatchPurchase } from "./batchPurchase/BatchPurchase";
import { BatchPurchase__factory } from "./batchPurchase/BatchPurchase__factory";
import { BatchTransfer } from "./batchTransfer/BatchTransfer";
import { BatchTransfer__factory } from "./batchTransfer/BatchTransfer__factory";
import { BatchENSManager } from "./batchENSManager/BatchENSManager";
import { BatchENSManager__factory } from "./batchENSManager/BatchENSManager__factory";
import { JsonRpcSigner } from "ethers";

export const getBatchRegisterContract = async (signer: JsonRpcSigner): Promise<BatchRegister> => {
    // initialise batch register contract of a particular network
    const network = await signer.provider.getNetwork();

    switch (network.chainId) {
        case BigInt(1):
            return BatchRegister__factory.connect(CONTRACTS.DIDHUB.BATCH_REGISTER.ETHEREUM, signer)
        case BigInt(5):
            return BatchRegister__factory.connect(CONTRACTS.DIDHUB.BATCH_REGISTER.GOERLI, signer)
        case BigInt(56):
            return BatchRegister__factory.connect(CONTRACTS.DIDHUB.BATCH_REGISTER.BNB, signer)
        case BigInt(137):
            return BatchRegister__factory.connect(CONTRACTS.DIDHUB.BATCH_REGISTER.POLYGON, signer)
        case BigInt(250):
            return BatchRegister__factory.connect(CONTRACTS.DIDHUB.BATCH_REGISTER.FANTOM, signer)
        case BigInt(42161):
            return BatchRegister__factory.connect(CONTRACTS.DIDHUB.BATCH_REGISTER.ARBITRUM, signer)
        default:
            throw Error(`Chain ${network.chainId.toString()} is not supported`);
    }
}

export const getBatchPurchaseContract = async (signer: JsonRpcSigner): Promise<BatchPurchase> => {
    // initialise batch register contract of a particular network
    const network = await signer.provider.getNetwork();
    switch (network.chainId) {
        case BigInt(1):
            return BatchPurchase__factory.connect(CONTRACTS.DIDHUB.BATCH_PURCHASE.ETHEREUM, signer)
        case BigInt(56):
            return BatchPurchase__factory.connect(CONTRACTS.DIDHUB.BATCH_PURCHASE.BNB, signer)
        case BigInt(137):
            return BatchPurchase__factory.connect(CONTRACTS.DIDHUB.BATCH_PURCHASE.POLYGON, signer)
        case BigInt(42161):
            return BatchPurchase__factory.connect(CONTRACTS.DIDHUB.BATCH_PURCHASE.ARBITRUM, signer)
        case BigInt(43114):
            return BatchPurchase__factory.connect(CONTRACTS.DIDHUB.BATCH_PURCHASE.AVALANCHE, signer)
        default:
            throw Error(`Chain ${network.chainId.toString()} is not supported`);
    }
}

export const getBatchTransferContract = async (signer: JsonRpcSigner): Promise<BatchTransfer> => {
    // initialise batch register contract of a particular network
    const network = await signer.provider.getNetwork();
    switch (network.chainId) {
        case BigInt(1):
            return BatchTransfer__factory.connect(CONTRACTS.DIDHUB.BATCH_TRANSFER.ETHEREUM, signer)
        case BigInt(56):
            return BatchTransfer__factory.connect(CONTRACTS.DIDHUB.BATCH_TRANSFER.BNB, signer)
        case BigInt(137):
            return BatchTransfer__factory.connect(CONTRACTS.DIDHUB.BATCH_TRANSFER.POLYGON, signer)
        case BigInt(250):
            return BatchTransfer__factory.connect(CONTRACTS.DIDHUB.BATCH_TRANSFER.FANTOM, signer)
        case BigInt(42161):
            return BatchTransfer__factory.connect(CONTRACTS.DIDHUB.BATCH_TRANSFER.ARBITRUM, signer)
        case BigInt(43114):
            return BatchTransfer__factory.connect(CONTRACTS.DIDHUB.BATCH_TRANSFER.AVALANCHE, signer)
        default:
            throw Error(`Chain ${network.chainId.toString()} is not supported`);
    }
}

export const getBatchENSManagerContract = async (signer: JsonRpcSigner): Promise<BatchENSManager> => {
    // initialise batch register contract of a particular network
    const network = await signer.provider.getNetwork();
    switch (network.chainId) {
        case BigInt(1):
            return BatchENSManager__factory.connect(CONTRACTS.DIDHUB.BATCH_ENS_MANAGER.ETHEREUM, signer)
        case BigInt(5):
            return BatchENSManager__factory.connect(CONTRACTS.DIDHUB.BATCH_ENS_MANAGER.GOERLI, signer)    
        default:
            throw Error(`Chain ${network.chainId.toString()} is not supported`);
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
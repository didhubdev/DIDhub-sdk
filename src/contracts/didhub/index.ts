import { BatchRegister } from "./BSC/BatchRegister";
import { BatchRegister__factory } from "./BSC/BatchRegister__factory";
import { CONTRACTS } from "../../config";
import { providers } from "ethers";

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
            throw Error("Chain is not supported");
    }
}

export { BatchRegister } from "./BSC/BatchRegister";
export { BatchRegister__factory } from './BSC/BatchRegister__factory';
import { BatchRegister } from "./BSC/BatchRegister";
import { BatchRegister__factory } from "./BSC/BatchRegister__factory";
import { CONTRACTS } from "../../config";
import { providers } from "ethers";

export const getBatchRegisterContract = (chain: string, provider: providers.JsonRpcSigner): BatchRegister => {
    // initialise batch register contract of a particular network
    switch (chain) {
        case "BNB":
            return (new BatchRegister__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.BNB
            );
        case "ARBITRUM":
            return (new BatchRegister__factory(provider)).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.ARBITRUM
            );
        default:
            throw Error("Chain not supported");
    }
}

export { BatchRegister } from "./BSC/BatchRegister";
export { BatchRegister__factory } from './BSC/BatchRegister__factory';
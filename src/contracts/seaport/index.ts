import { Seaport } from "./artifacts/Seaport";
import { Seaport__factory } from "./artifacts/Seaport__factory";
import { CONTRACTS } from "../../config";
import { providers } from "ethers";

export const getSeaportContract = (chain: string, provider: providers.JsonRpcSigner): Seaport => {
    // initialise batch register contract of a particular network
    switch (chain) {
        case "POLYGON":
            return (new Seaport__factory(provider)).attach(
                CONTRACTS.MARKETPLACE.SEAPORT1_5
            );
        case "ARBITRUM":
            return (new Seaport__factory(provider)).attach(
                CONTRACTS.MARKETPLACE.SEAPORT1_5
            );
        default:
            throw Error("Chain not supported");
    }
}

export { Seaport } from "./artifacts/Seaport";
export { Seaport__factory } from "./artifacts/Seaport__factory";
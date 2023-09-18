import { Seaport } from "./artifacts/Seaport";
import { Seaport__factory } from "./artifacts/Seaport__factory";
import { CONTRACTS } from "../../config";
import { providers } from "ethers";

export const getSeaportContract = async (provider: providers.JsonRpcSigner): Promise<Seaport> => {
    // initialise batch register contract of a particular network
    const chainId = await provider.getChainId();
    switch (chainId) {
        case 1:
            return (new Seaport__factory(provider)).attach(
                CONTRACTS.MARKETPLACE.SEAPORT1_5
            );
        case 137:
            return (new Seaport__factory(provider)).attach(
                CONTRACTS.MARKETPLACE.SEAPORT1_5
            );
        case 42161:
            return (new Seaport__factory(provider)).attach(
                CONTRACTS.MARKETPLACE.SEAPORT1_5
            );
        case 43114:
            return (new Seaport__factory(provider)).attach(
                CONTRACTS.MARKETPLACE.SEAPORT1_5
            );
        default:
            throw Error("Chain not supported");
    }
}

export { Seaport } from "./artifacts/Seaport";
export { Seaport__factory } from "./artifacts/Seaport__factory";
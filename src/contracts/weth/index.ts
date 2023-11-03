import { providers } from "ethers";
import { WETH } from "./WETH";
import { WETH__factory } from "./WETH__factory";
import { CONTRACTS } from "../../config";

export const getWrapTokenContract = async (provider: providers.JsonRpcSigner): Promise<WETH> => {
    // initialise batch register contract of a particular network
    const chainId = await provider.getChainId();
    switch (chainId) {
        case 1: 
            return (new WETH__factory(provider)).attach(
                CONTRACTS.WTOKEN.ETHEREUM
            );
        case 5:
            return (new WETH__factory(provider)).attach(
                CONTRACTS.WTOKEN.GOERLI
            );
        case 56:
            return (new WETH__factory(provider)).attach(
                CONTRACTS.WTOKEN.BNB
            );
        case 250:
            return (new WETH__factory(provider)).attach(
                CONTRACTS.WTOKEN.FANTOM
            );
        case 42161:
            return (new WETH__factory(provider)).attach(
                CONTRACTS.WTOKEN.ARBITRUM
            );
        default:
            throw Error(`Chain ${chainId} is not supported`);
    }
}
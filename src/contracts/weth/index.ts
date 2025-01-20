import { JsonRpcSigner } from "ethers";
import { WETH } from "./WETH";
import { WETH__factory } from "./WETH__factory";
import { CONTRACTS } from "../../config";

export const getWrapTokenContract = async (signer: JsonRpcSigner): Promise<WETH> => {
    // initialise batch register contract of a particular network
    const network = await signer.provider.getNetwork();
    switch (network.chainId) {
        case BigInt(1):
            return WETH__factory.connect(CONTRACTS.WTOKEN.ETHEREUM, signer) 
        case BigInt(5):
            return WETH__factory.connect(CONTRACTS.WTOKEN.GOERLI, signer)
        case BigInt(56):
            return WETH__factory.connect(CONTRACTS.WTOKEN.BNB, signer)
        case BigInt(137):
            return WETH__factory.connect(CONTRACTS.WTOKEN.POLYGON, signer)
        case BigInt(42161):
            return WETH__factory.connect(CONTRACTS.WTOKEN.ARBITRUM, signer)
        case BigInt(43114):
            return WETH__factory.connect(CONTRACTS.WTOKEN.AVALANCHE, signer)
        default:
            throw Error(`Chain ${network.chainId.toString()} is not supported`);
    }
}
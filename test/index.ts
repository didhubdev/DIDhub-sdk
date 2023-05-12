import { DIDhubSDK, IBatchRegister } from "@didhubdev/sdk";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.BSC_URL!);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// batch register with native token

// input params =================================================================
const domains = [
    {
        collectionInfo: "BSC:0x3Fc612F8EfF00870f3044FFd38AF26CAE951968E",
        nameKey: "SpaceId:bnb.testdidhubdomain",
        duration: "31536000" // 1 year
    }
];
const margin = 3; // 3%
const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK("BSC", secret, signer);

// get commitment status
const commitmentStatus = await sdk.did.batchCheckCommitment(domains);
// const br = sdk.did as IBatchRegister;
// const commitmentStatus = await br.batchCheckCommitment(domains);


import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.BSC_URL!);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const sdk = new DIDhubSDK("BSC", signer);

// batch register with native token

// input params =================================================================
const domains = [
    {
        collectionInfo: "BSC:0x3Fc612F8EfF00870f3044FFd38AF26CAE951968E",
        nameKey: "SpaceId:bnb.testdidhubdomain",
        duration: 31536000 // 1 year
    }
];
const margin = 3; // 3%

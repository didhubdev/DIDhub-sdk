import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();


const provider = new ethers.providers.JsonRpcBatchProvider(process.env.MAINNET_URL);

// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

// input params =================================================================
const names = [
    "didhubdev"
];
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer);

const fixedFee = await sdk.ens.getFixedFee();
console.log(fixedFee.toString());

const wrapStatus = await sdk.ens.batchCheckWrapStatus(names);
console.log(wrapStatus);



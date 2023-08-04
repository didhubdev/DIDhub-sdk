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
    "didhubdeveloper"
];
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer);

const fixedFee = await sdk.ens.getFixedFee();
console.log(fixedFee.toString());

// wrapping of domain requires wrapStatus = false, ownerStatus = true, and approval to didhub contract = true
const wrapStatus = await sdk.ens.batchCheckWrapStatus(names);
console.log(wrapStatus);

const isApprovedForWrap = await sdk.ens.batchCheckWrappedETH2LDApproval(names);
console.log(isApprovedForWrap);

if (isApprovedForWrap.includes(false)) {
    await sdk.ens.approveAllDomains(names);
}

// if (!wrapStatus.includes(true) && !ownerStatus.includes(true) && !isApprovedForWrap.includes(false)) {
//     const wrapTx = await sdk.ens.batchWrap(names);
//     await wrapTx.wait();
//     console.log(`Wrap transaction hash: ${wrapTx.hash}`);
// }
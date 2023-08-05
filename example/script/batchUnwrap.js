import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();


const provider = new ethers.providers.JsonRpcBatchProvider(process.env.MAINNET_URL);

// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

// input params =================================================================
const nameKeys = [
    "ENS:eth.didhubdeveloper"
];
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer);

const fixedFee = await sdk.ens.getFixedFee();
console.log(fixedFee.toString());

// wrapping of domain requires wrapStatus = false, ownerStatus = true, and approval to didhub contract = true
const wrapStatus = await sdk.ens.batchCheckWrapStatus(nameKeys);
console.log(wrapStatus);

const ownerStatus = await sdk.ens.batchCheckWrappedETH2LDOwnerStatus(nameKeys);
console.log(ownerStatus);

let isApprovedForWrap = await sdk.ens.batchCheckWrappedETH2LDApproval(nameKeys);
console.log(isApprovedForWrap);

if (isApprovedForWrap.includes(false)) {
    const approvalTx = await sdk.ens.approveWrappedETH2LDDomains();
    await approvalTx.wait();
    isApprovedForWrap = await sdk.ens.batchCheckWrappedETH2LDApproval(nameKeys);
}

if (!wrapStatus.includes(false) && !isApprovedForWrap.includes(false)) {
    const wrapTx = await sdk.ens.batchUnwrap(nameKeys);
    await wrapTx.wait();
    console.log(`Wrap transaction hash: ${wrapTx.hash}`);
}

// check 
const wrapStatusFinal = await sdk.ens.batchCheckWrapStatus(nameKeys);
console.log(wrapStatusFinal);
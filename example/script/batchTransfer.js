import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();


const provider = new ethers.providers.JsonRpcBatchProvider(process.env.BSC_URL);

// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

// input params =================================================================
const domainInfos = [
    "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6:98767530167842221783975406328797951877213142199629098756987993094010963968301",
    "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6:97040777110047548592679145313150576032705513539110094116444518058878986603331"
];
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer);

const fixedFee = await sdk.transfer.getFixedFee();
console.log(fixedFee.toString());

const isApprovedForTransfer = await sdk.transfer.batchCheckApproval(domainInfos);
console.log(isApprovedForTransfer);

let domainInfosToApprove = [];
for (let i = 0; i < isApprovedForTransfer.length ; i++ ) {
    if (isApprovedForTransfer[i] === false) {
        domainInfosToApprove.push(domainInfos[i]);
    }
}

// approve if needed
if (domainInfosToApprove.length > 0) {
    const approveTx = await sdk.transfer.approveAllDomains(domainInfosToApprove);
    await approveTx.wait();
}

// transfer
const transferTx = await sdk.transfer.batchTransfer(domainInfos, "0x9a10b04E87767457bD353cF97F0b3997B9feeF3A");
await transferTx.wait();
console.log(`Transfer transaction hash: ${transferTx.hash}`);
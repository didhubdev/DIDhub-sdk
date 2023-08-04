import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();


const provider = new ethers.providers.JsonRpcBatchProvider(process.env.MAINNET_URL);

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
const sdk = new DIDhubSDK(signer, secret);

const fixedFee = sdk;

// // approval needed if the paymentToken is not native token
if (paymentToken !== ZERO_ADDRESS) {
    // check and approve
    const approveTx = await sdk.register.approveERC20Tokens(paymentToken, registrationData.paymentMax);
    if (approveTx) await approveTx.wait();
    console.log(`Approved ERC20 Tokens`);
}

// // register
const registerTx = await sdk.register.batchRegister(registrationData.requests, registrationData.paymentToken, registrationData.paymentMax);
await registerTx.wait();
console.log(`Register transaction hash: ${registerTx.hash}`);
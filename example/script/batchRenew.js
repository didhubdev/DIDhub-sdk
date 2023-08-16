import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.BSC_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const domains = [
    {
        collectionInfo: "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6",
        nameKey: "SpaceId:bnb.100100100100100",
        duration: 60*60*24*28 // renew duration
    },
    {
        collectionInfo: "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6",
        nameKey: "SpaceId:bnb.fakeweb3",
        duration: 60*60*24*28
    }
];
const margin = 1; // 3%
// const paymentToken = ZERO_ADDRESS;
const paymentToken = ZERO_ADDRESS;
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer, secret);

// check if the signer is also the owner of the two tokens

// get price
const individualPrices = await sdk.register.getIndividualPrice(domains);
individualPrices.forEach((price, index) => {
    console.log(`Prices: ${price.price} ${paymentToken} for ${domains[index].nameKey}`);
});

// get price info for purchase
console.log("Getting price info for purchase...");
const renewData = await sdk.register.getPriceWithMargin(domains, paymentToken, margin);
console.log(`Total required tokens for ${paymentToken} is ${renewData.paymentMax.toString()}`);

// // approval needed if the paymentToken is not native token
if (paymentToken !== ZERO_ADDRESS) {
    // check and approve
    const approveTx = await sdk.register.approveERC20Tokens(paymentToken, renewData.paymentMax);
    if (approveTx) await approveTx.wait();
    console.log(`Approved ERC20 Tokens`);
}

// final check 
const finalCheck = await sdk.register.checkRenewConditions(renewData.paymentToken, renewData.paymentMax);
console.log(`Final check: ${finalCheck.success}`);
// print error if any
finalCheck.errors.forEach(error => {
    throw Error(`Error: ${error}`);
});

console.log(renewData.paymentMax);

// // register
const registerTx = await sdk.register.batchRenew(renewData.requests, renewData.paymentToken, renewData.paymentMax);
await registerTx.wait();
console.log(`Register transaction hash: ${registerTx.hash}`);
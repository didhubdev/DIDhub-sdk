import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

// input params =================================================================
const domains = [
    {
        collectionInfo: "GOERLI:0x114d4603199df73e7d157787f8778e21fcd13066",
        nameKey: "ENS:eth.henrybb",
        duration: 60*60*24*10 // renew duration
    }
];
const margin = 1; // 3%
// const paymentToken = ZERO_ADDRESS;
const paymentToken = ZERO_ADDRESS;
// =============================================================================

let secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

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
const renewTx = await sdk.register.batchRenew(renewData.requests, renewData.paymentToken, renewData.paymentMax);
await renewTx.wait();
console.log(`Renew transaction hash: ${registerTx.hash}`);
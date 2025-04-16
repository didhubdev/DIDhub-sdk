import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

const provider = new ethers.JsonRpcProvider(process.env.BSC_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const orderIds = [
  "DIDHUB:0x22ef448cecc12b956052014fca9c8582db09b4182e422d2d1542369b32441d87",
  "DIDHUB:0x7e71587127f77ec0a40200a2fb6c62750a7e25c79c1112ab363f10a146e0b6a3"
];
const margin = 3; // 3%
const paymentToken = ZERO_ADDRESS;
// const paymentToken = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
// =============================================================================

// instantiate SDK
console.log("Instantiating SDK...");
const sdk = new DIDhubSDK(signer, secret);
console.log("SDK Instantiated");

const advancedOrders = await sdk.opensea.getAdvancedListingOrders(orderIds);
console.log(advancedOrders);

console.log("Fetching Swap Info...");
const swapInfo = await sdk.opensea.getSwapInfo(advancedOrders, paymentToken, margin);
console.log(swapInfo);

// approval needed if the paymentToken is not native token
// if (paymentToken !== ZERO_ADDRESS) {    
//     // check and approve
//     console.log('Checking Approval');
//     const approveTx = await sdk.opensea.approveERC20Tokens(paymentToken, swapInfo.paymentMax);
//     if (approveTx) await approveTx.wait();
//     console.log(`Approved ERC20 Tokens`);
// }

// const gas = await sdk.opensea.estimateGas.fulfillListings(advancedOrders, swapInfo);
// console.log("Gas", gas);

const tx = await sdk.opensea.fulfillListings(advancedOrders, swapInfo);
const receipt = await tx.wait();
console.log("PUrchase Completed", receipt);

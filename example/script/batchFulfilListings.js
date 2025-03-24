import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const orderIds = [
  "OPENSEA:0xc03158ac41d052b50ca362d9089288a5dc37df1f294df71c3a457e37fd24bd3c",
  "OPENSEA:0x27cfacac2eb6136acb72f14a314455d4b299800c7d822877588aed699ce03e0f",
  "OPENSEA:0x854ec952801f17ab0fcd1eb821129396e8cd2a8ae26d27895d810b01737f3f56",
  "OPENSEA:0xac78081ca6f299b70180247c1fcce69036b3d5396d7db426c8d885e880991438",
  "OPENSEA:0x3e405fa5a1a5a5293f20bf6ab99c42106a11f5072b224723e3584aa7fa650f2c"
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
// const swapInfo = await sdk.opensea.getSwapInfo(advancedOrders, paymentToken, margin);

// approval needed if the paymentToken is not native token
// if (paymentToken !== ZERO_ADDRESS) {    
//     // check and approve
//     console.log('Checking Approval');
//     const approveTx = await sdk.opensea.approveERC20Tokens(paymentToken, swapInfo.paymentMax);
//     if (approveTx) await approveTx.wait();
//     console.log(`Approved ERC20 Tokens`);
// }

// // const gas = await sdk.opensea.estimateGas.fulfillListings(advancedOrders, swapInfo);
// // console.log("Gas", gas);

// const tx = await sdk.opensea.fulfillListings(advancedOrders, swapInfo);
// const receipt = await tx.wait();
// console.log("PUrchase Completed");

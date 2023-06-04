import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.POLYGON_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const orderIds = ["OPENSEA:0x4a872b16767cc83b39e5d0c832d1d09c842e8efd416c5585a5e287d74642e891", "OPENSEA:0x1c82949c830fd0614419d92c44563b4ba443c74181a81001bc82da3d718af30c"];
const margin = 3; // 3%
const paymentToken = ZERO_ADDRESS;
// const paymentToken = USDC;
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer, secret);

const swapInfo = await sdk.opensea.getSwapInfo(orderIds, paymentToken, margin);

console.log(swapInfo);

const tx = await sdk.opensea.fulfillListings(orderIds, swapInfo);
const receipt = await tx.wait();
console.log("PUrchase Completed");

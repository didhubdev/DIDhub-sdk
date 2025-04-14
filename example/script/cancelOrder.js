import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const provider = new ethers.JsonRpcProvider(process.env.BSC_URL);

// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log("address", await signer.getAddress());
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

const orders = [
    "DIDHUB:0x734ffd78b260e53ae9ebd52d8212b088ada4cc7d3aa19917368429f6cebba487"
];

// instantiate SDK
console.log("Instantiating SDK...");
const sdk = new DIDhubSDK(signer, "dev", secret);
console.log("SDK Instantiated");

const tx = await sdk.opensea.cancelOrders(orders);
await tx.wait();
console.log("Order Cancelled");
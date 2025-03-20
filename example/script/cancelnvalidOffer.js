import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_URL);

// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================

const domainInfo = "ETHEREUM:0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:79233663829379634837589865448569342784712482819484549289560981379859480642508";
const paymentToken = `ETHEREUM:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2`;
const paymentAmount = 0.003;
// =============================================================================

// instantiate SDK
console.log("Instantiating SDK...");
const sdk = new DIDhubSDK(signer, "dev", secret);
console.log("SDK Instantiated");

const orders = await sdk.opensea.getInvalidOffers(domainInfo, paymentToken, paymentAmount);
console.log(orders);
// const tx = await sdk.opensea.cancelInvalidListings(domainInfo, paymentToken, paymentAmount);
// if (!tx) {
//     console.log("No invalid listings found");
// } else {
//     const receipt = await tx.wait();
//     console.log("Cancel Completed");
// }

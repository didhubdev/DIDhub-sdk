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

const domainInfo = "ARBITRUM:0x5d482d501b369f5ba034dec5c5fb7a50d2d6ca20:56781014848996659361942283062730746419620396074334958898263521396697877991490";
const paymentToken = `POLYGON:${ZERO_ADDRESS}`;
const paymentAmount = BigInt(1);
// =============================================================================

// instantiate SDK
console.log("Instantiating SDK...");
const sdk = new DIDhubSDK(signer, "dev", secret);
console.log("SDK Instantiated");


const tx = await sdk.opensea.cancelInvalidListings(domainInfo, paymentToken, paymentAmount);
const receipt = await tx.wait();
console.log("Cancel Completed");
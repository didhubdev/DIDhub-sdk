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

const domainInfo = "POLYGON:0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f:90332032219905137231330041530355047592553662674176468327035269520525908421041";
const paymentToken = `POLYGON:${ZERO_ADDRESS}`;
const paymentAmount = "10120000000000000000";
// =============================================================================

// instantiate SDK
console.log("Instantiating SDK...");
const sdk = new DIDhubSDK(signer, "dev", secret);
console.log("SDK Instantiated");

const orders = await sdk.opensea.getInvalidListings(domainInfo, paymentToken, paymentAmount);
console.log(orders);

// const tx = await sdk.opensea.cancelInvalidListings(domainInfo, paymentToken, paymentAmount);
// if (!tx) {
//     console.log("No invalid listings found");
// } else {
//     const receipt = await tx.wait();
//     console.log("Cancel Completed");
// }

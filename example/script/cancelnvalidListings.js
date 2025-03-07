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

const domainInfo = "POLYGON:0xe7e7ead361f3aacd73a61a9bd6c10ca17f38e945:85997366236755947607067999964956450388242871860011819749993866159229883053823";
const paymentToken = `POLYGON:${ZERO_ADDRESS}`;
const paymentAmount = BigInt(100);
// =============================================================================

// instantiate SDK
console.log("Instantiating SDK...");
const sdk = new DIDhubSDK(signer, "dev", secret);
console.log("SDK Instantiated");

const tx = await sdk.opensea.cancelInvalidListings(domainInfo, paymentToken, paymentAmount);
if (!tx) {
    console.log("No invalid listings found");
} else {
    const receipt = await tx.wait();
    console.log("Cancel Completed");
}

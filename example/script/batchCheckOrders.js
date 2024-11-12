import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.MAINNET_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";
const environment = "dev";

// input params =================================================================
const orderIds = [
  "OPENSEA:0x39d99308691cb063bd669ddde025b8ab5d1ec60a4b6c28afe61f71ac4bbe91af",
  "OPENSEA:0x8c01925b702f2e76c250e5f9d92bf072167cf17cc6273f314138a84a49ffe807"
];
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer, environment, secret);

const validity = await sdk.opensea.checkOrderValidity(orderIds);
console.log(validity);
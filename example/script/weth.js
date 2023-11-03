import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.BSC_URL);

// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

let secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// instantiate SDK
const sdk = new DIDhubSDK(signer, secret);

// test wrap token

const tx = await sdk.utils.wrapEth2Weth(ethers.utils.parseEther("0.0001"));
const receipt = await tx.wait();
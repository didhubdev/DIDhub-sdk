import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.BSC_URL!);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const sdk = new DIDhubSDK("BSC", signer);

// batch 
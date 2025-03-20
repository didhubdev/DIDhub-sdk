import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();


const provider = new ethers.JsonRpcProvider(process.env.POLYGON_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// you cannot offer native tokens 0x0000000000000000000000000000000000000000
const paymentToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase();
// const paymentToken = "0x0000000000000000000000000000000000000000"

// required to be greater than 0;
const paymentAmount = "300000000000000";

const seconds = 10 * 60;

// instantiate SDK
const sdk = new DIDhubSDK(signer, 'dev');

// const offerItemList = [
//     {
//         domainInfo: "ETHEREUM:0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85:82680855839883466377211380904049433708862793209978755245806227344788314668872",
//         paymentToken: paymentToken,
//         paymentAmount: paymentAmount,
//         endInSeconds: seconds
//     }
// ]

const data = await sdk.opensea.cancelOrders(
    ["OPENSEA:0xc2d92521dcb48da90d38f447f2f4a701c9e376058bdd11fd0ea6b21a30c1220e"]
);

console.log(data);
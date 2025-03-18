import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();


const provider = new ethers.JsonRpcProvider(process.env.POLYGON_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// you cannot offer native tokens 0x0000000000000000000000000000000000000000
// const paymentToken = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const paymentToken = "0x0000000000000000000000000000000000000000"

// required to be greater than 0;
const paymentAmount = "10000000";

const seconds = 3 * 86400;

// instantiate SDK
const sdk = new DIDhubSDK(signer, 'dev');

const offerItemList = [
    {
        domainInfo: "POLYGON:0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f:51018332471729072686741156727101328764561454116139309942829108293103691142900",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInSeconds: seconds
    }
]

const data = await sdk.opensea.bulkOfferDomain(
    offerItemList
);

console.log(data);
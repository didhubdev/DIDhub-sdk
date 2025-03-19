import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();


const provider = new ethers.JsonRpcProvider(process.env.POLYGON_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// you cannot offer native tokens 0x0000000000000000000000000000000000000000
const paymentToken = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
// const paymentToken = "0x0000000000000000000000000000000000000000"

// required to be greater than 0;
const paymentAmount = "400000000000000";

const seconds = 10 * 60;

// instantiate SDK
const sdk = new DIDhubSDK(signer, 'dev');

const offerItemList = [
    {
        domainInfo: "POLYGON:0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f:51018332471729072686741156727101328764561454116139309942829108293103691142900",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInSeconds: seconds
    },
    {
        domainInfo: "POLYGON:0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f:51018332471729072686741156727101328764561454116139309942829108293103691142900",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInSeconds: 599
    }
]

const data = await sdk.opensea.bulkOfferDomain(
    offerItemList
);

console.log(data);
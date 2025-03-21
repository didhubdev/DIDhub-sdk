import { DIDhubSDK } from "@didhubdev/sdk";
import dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config();

// note this code probably cannot be run off browser with metamask, as it requires mannual signature

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// you cannot offer native tokens 0x0000000000000000000000000000000000000000
const paymentToken = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";
// required to be greater than 0;
const paymentAmount = "100000000000000";
const seconds = 7 * 30 * 86400;

// instantiate SDK
const sdk = new DIDhubSDK(signer);

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

// if (offerItemList.length > 1) {

//   console.log(data);
// } else if (offerItemList.length === 1) {
//   const data = await sdk.opensea.bulkOfferDomain(
//     ...offerItemList[0]
//   );
//   console.log(data);  
// }


// cancel prevous listings if the current one is higher

// 1. get the best listing from didhub api
// 2. get the orderId of the best listing
// 3. cancel that order
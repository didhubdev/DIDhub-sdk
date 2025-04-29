import { DIDhubSDK } from "@didhubdev/sdk";
import dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config();

// note this code probably cannot be run off browser with metamask, as it requires mannual signature

const provider = new ethers.JsonRpcProvider(process.env.ARB_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// you cannot offer native tokens 0x0000000000000000000000000000000000000000
const paymentToken = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
// required to be greater than 0;
const paymentAmount = "100000000000000";
const seconds = 30 * 86400;

// instantiate SDK
const sdk = new DIDhubSDK(signer, 'dev');

const offerItemList = [
    {
        domainInfo: "ARBITRUM:0x5d482d501b369f5ba034dec5c5fb7a50d2d6ca20:56781014848996659361942283062730746419620396074334958898263521396697877991490",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInSeconds: seconds
    }
]

const data = await sdk.opensea.bulkOfferDomain(
  offerItemList
);
console.log(data);

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
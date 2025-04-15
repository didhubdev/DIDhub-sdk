import { ethers } from "ethers";
import { DIDhubSDK } from "@didhubdev/sdk";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.BSC_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const paymentToken = "0x0000000000000000000000000000000000000000";
// required to be greater than 0;
const paymentAmount = "100000000000000000000000";
const seconds = 6000;

// instantiate SDK
const sdk = new DIDhubSDK(signer, 'dev');

const listingItemList = [
    {
        domainInfo: "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6:64739995938262730871006573089459840521429569582608973043285783201569142320402",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInSeconds: seconds
    },
    {
        domainInfo: "BNB:0x2723522702093601e6360cae665518c4f63e9da6:1136982",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInSeconds: seconds
    }
]

const data = await sdk.opensea.bulkListDomain(
  listingItemList,
  "DIDhub"
);

console.log(data);

// if (listingItemList.length > 1) {
//   const data = await sdk.opensea.bulkListDomain(
//     listingItemList
//   );
//   console.log(data);
// } else if (listingItemList.length === 1) {
//   const data = await sdk.opensea.listDomain(
//     ...listingItemList[0]
//   );
//   console.log(data);  
// }

// cancel prevous listings if the current one is higher

// 1. get the best listing from didhub api
// 2. get the orderId of the best listing
// 3. cancel that order
import { DIDhubSDK } from "@didhubdev/sdk";
import dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config();

// note this code probably cannot be run off browser with metamask, as it requires mannual signature

const provider = new ethers.JsonRpcProvider(process.env.BSC_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// you cannot offer native tokens 0x0000000000000000000000000000000000000000
const paymentToken = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
// required to be greater than 0;
const paymentAmount = "100000000000000";
const seconds = 6000;

// instantiate SDK
const sdk = new DIDhubSDK(signer, 'dev');

const offerItemList = [
  {
    domainInfo: "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6:64739995938262730871006573089459840521429569582608973043285783201569142320402",
    paymentToken: paymentToken,
    paymentAmount: paymentAmount,
    endInSeconds: seconds
  },
  {
      domainInfo: "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6:49656641397756061427599558930439699923854501080639995265230186499699621911561",
      paymentToken: paymentToken,
      paymentAmount: paymentAmount,
      endInSeconds: seconds
  }
]

const data = await sdk.opensea.bulkOfferDomain(
  offerItemList,
    "DIDhub"
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
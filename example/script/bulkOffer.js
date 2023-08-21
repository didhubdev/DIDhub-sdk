import { DIDhubSDK } from "@didhubdev/sdk";
import dotenv from "dotenv";
dotenv.config();

// note this code probably cannot be run off browser with metamask, as it requires mannual signature

// you cannot offer native tokens 0x0000000000000000000000000000000000000000
const paymentToken = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
// required to be greater than 0;
const paymentAmount = "10000000";
const days = 3;

// instantiate SDK
const sdk = new DIDhubSDK(signer);

const offerItemList = [
    {
        domainInfo: "ARBITRUM:0x5d482d501b369f5ba034dec5c5fb7a50d2d6ca20:44757220479873475499417394956709258049408853905933600993750279449126336807650",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInDays: days
    },
    {
        domainInfo: "ARBITRUM:0x5d482d501b369f5ba034dec5c5fb7a50d2d6ca20:75929374021859289291622697546462537355723386629617419619730625006267318394115",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInDays: days
    }
]

if (offerItemList.length > 1) {
  const data = await sdk.opensea.bulkOfferDomain(
    offerItemList
  );
  console.log(data);
} else if (offerItemList.length === 1) {
  const data = await sdk.opensea.bulkOfferDomain(
    ...offerItemList[0]
  );
  console.log(data);  
}


// cancel prevous listings if the current one is higher

// 1. get the best listing from didhub api
// 2. get the orderId of the best listing
// 3. cancel that order
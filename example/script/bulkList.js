import { DIDhubSDK } from "@didhubdev/sdk";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const paymentToken = "0x0000000000000000000000000000000000000000";
// required to be greater than 0;
const paymentAmount = "100000000000000000000000";
const seconds = 600;

// instantiate SDK
const sdk = new DIDhubSDK(signer, 'dev');

const listingItemList = [
    {
        domainInfo: "POLYGON:0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f:23792956021131460667644173736947503464860634376943869576796385124893477090103",
        paymentToken: paymentToken,
        paymentAmount: paymentAmount,
        endInSeconds: seconds
    }
]

if (listingItemList.length > 1) {
  const data = await sdk.opensea.bulkListDomain(
    listingItemList
  );
  console.log(data);
} else if (listingItemList.length === 1) {
  const data = await sdk.opensea.listDomain(
    ...listingItemList[0]
  );
  console.log(data);  
}

// cancel prevous listings if the current one is higher

// 1. get the best listing from didhub api
// 2. get the orderId of the best listing
// 3. cancel that order
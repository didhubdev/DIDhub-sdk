import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.BSC_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const domains = [
    {
        collectionInfo: "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6",
        nameKey: "SpaceId:bnb.mimuma",
        duration: 31536000 // 1 year
    }
];
const margin = 3; // 3%
const paymentToken = ZERO_ADDRESS;
// const paymentToken = USDC;
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer, secret);

// get availablity status
let domainsAvailable = [];
const availabilityStatus = await sdk.register.batchCheckAvailability(domains);
// remove domain from list if not available
availabilityStatus.forEach((status, index) => {
    if (status) {
        domainsAvailable.push(domains[index]);
    }
    console.log(`Domain ${domains[index].nameKey} is ${status ? "available" : "not available"}`);
});  


// get price
const individualPrices = await sdk.register.getIndividualPrice(domainsAvailable);
individualPrices.forEach((price, index) => {
    console.log(`Prices: ${price.price} ${paymentToken} for ${domainsAvailable[index].nameKey}`);
});

// get commitment status
const commitmentStatus = await sdk.register.batchCheckCommitment(domainsAvailable);

// if status is not 2, try to commit
let domainsToCommit = [];
commitmentStatus.forEach((status, index) => {
    if (status !== 2) {
        domainsToCommit.push(domainsAvailable[index]);
    }
});

// get commitment hashes
const commitmentInfos = await sdk.register.batchMakeCommitments(domainsToCommit);

// if (commitmentInfos.length > 0) {
//     // commit on chain
//     const commitTx = await sdk.register.batchCommit(commitmentInfos);
//     await commitTx.wait();

//     // wait some time (20 seconds should be sufficient for bsc)
//     console.log("Waiting for 20 seconds for the commitment to be mined...");
//     await new Promise(resolve => setTimeout(resolve, 20000));
// }

// get price info for purchase
const registrationData = await sdk.register.getPriceWithMargin(domainsAvailable, paymentToken, margin);
console.log(`Total required tokens for ${paymentToken} is ${registrationData.paymentMax.toString()}`);

// // approval needed if the paymentToken is not native token
// if (paymentToken !== ZERO_ADDRESS) {
//     // check and approve
//     const approveTx = await sdk.register.approveERC20Tokens(paymentToken, registrationData.paymentMax);
//     if (approveTx) await approveTx.wait();
//     console.log(`Approved ERC20 Tokens`);
// }

// final check 
const finalCheck = await sdk.register.checkPurchaseConditions(domainsAvailable, registrationData.paymentToken, registrationData.paymentMax);
console.log(`Final check: ${finalCheck.success}`);
// print error if any
finalCheck.errors.forEach(error => {
    console.log(`Error: ${error}`);
});

// register
const registerTx = await sdk.register.batchRegister(registrationData.requests, registrationData.paymentToken, registrationData.paymentMax);
await registerTx.wait();
console.log(`Register transaction hash: ${registerTx.hash}`);
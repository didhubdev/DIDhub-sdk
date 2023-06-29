import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.MAINNET_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const domains = [
    {
        collectionInfo: "ETHEREUM:0x65483c6b707f51ae3bD8Ed6319B6f3643828e38d",
        nameKey: "Metalk Name Service:didhub",
        duration: 60*60*24*28
    },
    {
        collectionInfo: "ETHEREUM:0x2A187453064356c898cAe034EAed119E1663ACb8",
        nameKey: "Decentraland Names:eth.dcl.didhub",
        duration: 60*60*24*28
    }
];
const margin = 1; // 3%
// const paymentToken = ZERO_ADDRESS;
const paymentToken = ZERO_ADDRESS;
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
console.log(commitmentStatus);
// if status is not 2 nor 4, try to commit
let domainsToCommit = [];
commitmentStatus.forEach((status, index) => {
    if (status !== 2 && status !== 4) {
        domainsToCommit.push(domainsAvailable[index]);
    }
});
console.log("Domains to Commit", domainsToCommit);
// get commitment hashes
const commitmentInfos = await sdk.register.batchMakeCommitments(domainsToCommit);
console.log("Got Commitment Info");

if (commitmentStatus.filter(n=>n!=2&&n!=4).length > 0) {
    // commit on chain
    const commitTx = await sdk.register.batchCommit(commitmentInfos);
    await commitTx.wait();

    // wait some time (20 seconds should be sufficient for bsc)
    console.log("Waiting for 60 seconds for the commitment to be mined...");
    await new Promise(resolve => setTimeout(resolve, 60000));
}

// get price info for purchase
console.log("Getting price info for purchase...");
const registrationData = await sdk.register.getPriceWithMargin(domainsAvailable, paymentToken, margin);
console.log(`Total required tokens for ${paymentToken} is ${registrationData.paymentMax.toString()}`);

// // approval needed if the paymentToken is not native token
if (paymentToken !== ZERO_ADDRESS) {
    // check and approve
    const approveTx = await sdk.register.approveERC20Tokens(paymentToken, registrationData.paymentMax);
    if (approveTx) await approveTx.wait();
    console.log(`Approved ERC20 Tokens`);
}

// final check 
const finalCheck = await sdk.register.checkPurchaseConditions(domainsAvailable, registrationData.paymentToken, registrationData.paymentMax);
console.log(`Final check: ${finalCheck.success}`);
// print error if any
finalCheck.errors.forEach(error => {
    throw Error(`Error: ${error}`);
});

console.log(registrationData.paymentMax);

// // register
const registerTx = await sdk.register.batchRegister(registrationData.requests, registrationData.paymentToken, registrationData.paymentMax);
await registerTx.wait();
console.log(`Register transaction hash: ${registerTx.hash}`);
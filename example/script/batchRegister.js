import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers, JsonRpcProvider } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const maxFeePerGas = "50000000000" // 25 gwei

const provider = new JsonRpcProvider(process.env.MAINNET_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const domains = [
    {
        collectionInfo: "ETHEREUM:0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401",
        nameKey: "ENS:eth.123456789kasdfaljsd",
        duration: 28 * 86500, // 365 days
    },
    {
        collectionInfo: "ETHEREUM:0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401",
        nameKey: "ENS:eth.123456789kasdfaljsd",
        duration: 28 * 86500, // 365 days
    }
];

const margin = 3; // 3%
// const paymentToken = ZERO_ADDRESS;
const paymentToken = ZERO_ADDRESS;
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer, "dev", secret);

// check platform fee
const platformFee = await sdk.register.didhubFee();
console.log(`Platform fee is ${platformFee.toString()}`);

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

const estimatedGas = await sdk.register.estimateGas.batchCommit(commitmentInfos);
console.log(estimatedGas.toString());

if (commitmentStatus.filter(n=>n!=2&&n!=4).length > 0) {
    // commit on chain
    const estimatedGas = await sdk.register.estimateGas.batchCommit(commitmentInfos);
    console.log("Estimated Gas", estimatedGas.toString());

    // const commitTx = await sdk.register.batchCommit(commitmentInfos);
    // await commitTx.wait();

    // wait some time (20 seconds should be sufficient for bsc)
    // const timeZero = Math.floor(Date.now() / 1000);
    // while (true) {
    //     console.log("Waiting for 5 seconds for the commitment to be mined...");
    //     await new Promise(resolve => setTimeout(resolve, 5000));
        
    //     const totalWaitedTime = Math.floor(Date.now() / 1000) - timeZero;
    //     console.log(`Total waited time: ${totalWaitedTime} seconds`);

    //     // get commitment status
    //     console.log('Fetching Commit Status Again')
    //     const commitmentStatusAgain = await sdk.register.batchCheckCommitment(domainsAvailable);
    //     console.log(commitmentStatusAgain);
        
    //     if (commitmentStatusAgain.filter(n=>n!=2&&n!=4).length === 0) {
    //         break;
    //     }
    // }
}

// console.log("Commitment Done");

// // get price info for purchase
// console.log("Getting price info for purchase...");
// const registrationData = await sdk.register.getPriceWithMargin(domainsAvailable, paymentToken, margin);
// console.log(`Total required tokens for ${paymentToken} is ${registrationData.paymentMax.toString()}`);

// // // approval needed if the paymentToken is not native token
// if (paymentToken !== ZERO_ADDRESS) {
//     // check and approve
//     const approveTx = await sdk.register.approveERC20Tokens(paymentToken, registrationData.paymentMax);
//     if (approveTx) await approveTx.wait();
//     console.log(`Approved ERC20 Tokens`);
// }

// // final check 
// const finalCheck = await sdk.register.checkPurchaseConditions(domainsAvailable, registrationData.paymentToken, registrationData.paymentMax);
// console.log(`Final check: ${finalCheck.success}`);
// // print error if any
// finalCheck.errors.forEach(error => {
//     throw Error(`Error: ${error}`);
// });

// console.log(registrationData.paymentMax);

// const estimatedGas = await sdk.register.estimateGas.batchRegister(registrationData.requests, registrationData.paymentToken, registrationData.paymentMax);
// console.log("Estimated Gas", estimatedGas.toString());

// // // register
// const registerTx = await sdk.register.batchRegister(registrationData.requests, registrationData.paymentToken, registrationData.paymentMax, maxFeePerGas);
// await registerTx.wait();
// console.log(`Register transaction hash: ${registerTx.hash}`);
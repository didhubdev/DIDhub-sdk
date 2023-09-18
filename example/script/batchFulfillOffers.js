import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const provider = new ethers.providers.JsonRpcBatchProvider(process.env.ARB_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const orderIds = ["OPENSEA:0xd39c7144734f11e19c623659e1984263a96b6d9ea2c8cf381cad773c9cac3ce3", "OPENSEA:0x432faf876e004007c81088ff29a84cb253673afa5e0c909f46c47ae7a2e2e1b0"];
const margin = 1; // 3%
// const paymentToken = ZERO_ADDRESS;
const paymentToken = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer, secret);

const advancedOrders = await sdk.opensea.getAdvancedOfferOrders(orderIds);

// get the domains to transfer according to the offers
let tokensToTransfer = advancedOrders.map((order) => {
    const token = order.parameters.consideration.filter(c=>[2, 3].includes(c.itemType))[0];
    return {
      tokenContract: token.token,
      tokenId: token.identifierOrCriteria,
    };
});
console.log(advancedOrders);

// check approvals and make approvals to those tokens
console.log("checking approval");
const approvals = await sdk.opensea.batchCheckApprovalERC721orERC1155(tokensToTransfer);
console.log("Approvals", approvals);

// get tokens that are not approved
const tokensToApprove = tokensToTransfer.filter((t, i) => !approvals[i]);

// approve tokens
for (const token of tokensToApprove) {
    console.log("approving token");
    const approveTx = await sdk.opensea.approveERC721orERC1155Tokens(token.tokenContract);
    if (approveTx) await approveTx.wait();
    console.log(`Approved ERC721/1155 Tokens`);
}

// check again
const approvals2 = await sdk.opensea.batchCheckApprovalERC721orERC1155(tokensToTransfer);
console.log("Approvals", approvals2);

// fulfill Offers
const tx = await sdk.opensea.fulfillOffers(advancedOrders);
const receipt = await tx.wait();
console.log("Purchase Completed");

import { DIDhubSDK } from "@didhubdev/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_URL);
// init signer from private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// swap the above with metamask provider if used in frontend

const secret = "0x8a2b7c04ef98fce0301c40fd14227061129cdc3e5f03e6dfc16f088c57c85de8";

// input params =================================================================
const orderIds = ["OPENSEA:0x1c87574043c0c3d90552a9ba63053f9a62be9532bd202d863f305a491fce9406"];
const margin = 1; // 3%
// const paymentToken = ZERO_ADDRESS;
const paymentToken = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";
// =============================================================================

// instantiate SDK
const sdk = new DIDhubSDK(signer, "dev", secret);

const advancedOrders = await sdk.opensea.getAdvancedOfferOrders(orderIds);

// get the domains to transfer according to the offers
// let tokensToTransfer = advancedOrders.map((order) => {
//     const token = order.parameters.consideration.filter(c=>[2, 3].includes(c.itemType))[0];
//     return {
//       tokenContract: token.token,
//       tokenId: token.identifierOrCriteria,
//     };
// });
// console.log(advancedOrders);

// // check approvals and make approvals to those tokens
// console.log("checking approval");
// const approvals = await sdk.opensea.batchCheckApprovalERC721orERC1155(tokensToTransfer);
// console.log("Approvals", approvals);

// // get tokens that are not approved
// const tokensToApprove = tokensToTransfer.filter((t, i) => !approvals[i]);

// approve tokens
// for (const token of tokensToApprove) {
//     console.log("approving token");
//     const approveTx = await sdk.opensea.approveERC721orERC1155Tokens(token.tokenContract);
//     if (approveTx) await approveTx.wait();
//     console.log(`Approved ERC721/1155 Tokens`);
// }

// check again
// const approvals2 = await sdk.opensea.batchCheckApprovalERC721orERC1155(tokensToTransfer);
// console.log("Approvals", approvals2);

// fulfill Offers
// const tx = await sdk.opensea.fulfillOffers(advancedOrders);
// const receipt = await tx.wait();
// console.log("Purchase Completed");

const tx = await sdk.opensea.fulfillOffer("OPENSEA:0xeeb87207c56d5e05b810ec6824c8d1149e15ce72ea5e429d3fc6c02e352a5564");
const receipt = await tx.wait();
console.log("Purchase Completed");

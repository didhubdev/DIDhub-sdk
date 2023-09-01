# didhub-sdk
DIDhub SDK

# Installation
Install with npm
```
npm install @didhubdev/sdk
```

Install with yarn
```
yarn add @didhubdev/sdk
```

# Deployed Smart Contracts
| contract name | chain | address | fee |
| --- | --- | --- |
| Batch Register | BSC | 0x35580f058022d7BA612D1ba31CedFaCC019091a9 | 10% |
| Batch Register | ARBITRUM | 0x2ce430A5e124308e3D6CAEcA392ed3AB03c74DE1 | 10% |
| Batch Register | FANTOM | 0x2ce430A5e124308e3D6CAEcA392ed3AB03c74DE1 | 10% |
| Batch Register | ETHEREUM | 0xD7356f1FC4acc3557cA5E213D3f467FdAeC0140f | 10% |
| Batch Purchase | POLYGON | 0xb2107398C22c28d153977ae85D2ED119b814Ea3B | 0% |
| Batch Purchase | ARBITRUM | 0x3e9dc22105Fb119936f3E570cFd366F493bb4a6E | 0% |

# Usage

## Initalise SDK
```
const sdk = new DIDhubSDK(signer, secret);
```
signer, e.g. metamask signer \

secret is any 32 bytes hash. It creates uncertainly in the commit process. It is recommended to generate one for each user. This variable is optional

## Inputs for Domain Name Registration
```
const domains = [
    {
        collectionInfo: "BNB:0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6",
        nameKey: "SpaceId:bnb.xxxyyyzzz",
        duration: 31536000 // 1 year
    }
];
const margin = 3; // 3%
const paymentToken = ZERO_ADDRESS;
```
domains is a list of domain information that contains the collectionInfo (${chain}:${contractAddress}),  nameKey, and duration. \
margin is the slipage of the swap. Put 0 if you are certain that no token swap will take place \
paymentToken is the token to pay for the domain. Supported tokens are listed below:
| chain | token symbol | address |
| --- | --- | --- |
| BSC | Native | 0x0000000000000000000000000000000000000000 |
| BSC | WBNB | 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c |
| BSC | USDC | 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d |
| ARBITRUM | Native | 0x0000000000000000000000000000000000000000 |
| ARBITRUM | WBNB | 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1 |
| ARBITRUM | USDC | 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8 |

## Functions to interact with the DIDHUB batch registration contract

Please follow the following steps to purchase domains in bulk with the DIDHUB contract. See ./test/index.ts for a comphrensive flow of domain purchase.

### Check Domain Availability
```
const availabilityStatus = await sdk.register.batchCheckAvailability(domains);
```

### Check Commit Status
There are 5 different commit status types:
-  0: not exist, requires commit
-  1: available but before minCommitmentAge
-  2: available and after minCommitmentAge and before maxCommitmentAge, or does not require commitment
-  3: available and after maxCommitmentAge, requires commit
-  4: commit not required
```
const commitmentStatus = await sdk.register.batchCheckCommitment(domains);
```

### Get Individual Price for the domain names
```
const individualPrices = await sdk.register.getIndividualPrice(domains);
```

### Get Commit Data 
Obtain the data that will be used as input to the commit function
```
const commitmentInfos = await sdk.register.batchMakeCommitments(domains);
```

### Commit the domain names on chain
A on-chain transaction to commit the domain names. Wait 10 seconds at least of the commit transaction as required by Space Id
```
const commitTx = await sdk.register.batchCommit(commitmentInfos);
await commitTx.wait();
```

### Get Domain Purchase Data
Below is the function to obtain the data input for the batchRegister function.
```
const registrationData = await sdk.register.getPriceWithMargin(domains, paymentToken, margin)
```

### Get Supported token list
```
cont tokenList = await sdk.register.getSupportedTokens()
```

### Check ERC20 token balance
```
const balance = await sdk.register.getERC20balance(tokenAddress)
```

### Approve ERC20 tokens if necessary
If you want to purchase the domains with tokens that are different from the type specified by the domain name project, you need to approve the DIDhub contract to take custody of your tokens, perform swapping and purchase the domain on your behalf
```
const approveTx = await sdk.register.approveERC20Tokens(paymentToken, amount);
await approveTx.wait()
```

### Final Check before Register
This function does a final check on all conditions, such as availability, commit statuses, token balance, token approval. It is recommended to use the function before Batch Register
```
const finalCheck = await sdk.register.checkPurchaseConditions(domains, registrationData.paymentToken, registrationData.paymentMax);
```
The return variable contains the followings
```
success //whether the transaction will suceed
availabilityStatus //A list containing the availability status of the domains to the input domain list
commitmentStatus //A list containing the commitment status of the domains from the input domain list
errors //A list of error message if something is not right
```

### Batch Register
Use the registration data as input for the purchase. The SDK will handle cases of both native tokens and ERC20 tokens.
```
const registerTx = await sdk.register.batchRegister(registrationData.requests, registrationData.paymentToken, registrationData.paymentMax);
```

## Functions to interact with Opensea

Supported Chains: BNB, ARBITRUM, POLYGON


### Make Offer
Note that it is not possible to offer native token. \
Approval process is automatically handled.
```
const data = await sdk.opensea.offerDomain(domainInfo, paymentToken, amount, days);
```

### Batch Make Offers
Batch offer an array of domains
```
const data = await sdk.opensea.bulkOfferDomain(offerDataArray);
```
where offerDataArray is given as follows
```
const offerDataArray = {
    domainInfo: domainInfo,
    paymentToken: paymentToken,
    amount: amount, 
    days: days
}
```

### List Domain
Approval is automatically handled.
```
const data = await sdk.opensea.listDomain(domainInfo, paymentToken, amount, days);
```

### Batch List Domain
Batch list an array of domains
```
const data = await sdk.opensea.bulkListDomain(listingDataArray);
```
where listingDataArray is given as follows
```
const listingDataArray = {
    domainInfo: domainInfo,
    paymentToken: paymentToken,
    amount: amount, 
    days: days
}
```

### Accept Offer
```
const tx = await sdk.opensea.fulfillOffer(orderId);
```

### Fulfill Listing
```
const tx = await sdk.opensea.fulfillListing(orderId);
```

### Cancel Order
This can take in an array of both offer or listing orders
```
const tx = await sdk.opensea.cancelOrders(orderIds);
```

### Fulfill Multiple Listings
Fulfill multiple listings in one transaction, using a single token type as input. If the orders require payment of different token types, the input tokens will be swapped to the targe token type. There are 3 steps to complete this operation:

1. Obtain the advanced order information using orderId. It is recommended to do this at the time when users add items to cart, instead of doing it in one go during checkout.
```
const advancedOrders = await sdk.opensea.getAdvancedOrders(orderIds);
```
2. Before transaction, the user will choose a token type to complete the purchase, and select the slippage that he/she will toleration in case the target price cannot be met.
```
const swapInfo = await sdk.opensea.getSwapInfo(advancedOrders, paymentToken, margin);
```
3. Approve the DIDHub for the amount of token that will be used in the purchase if needded
```
const approveTx = await sdk.opensea.approveERC20Tokens(paymentToken, swapInfo.paymentMax);
```
4. Finally, complete the transaction with the obtained in the previous functions
```
const purchaseTx = await sdk.opensea.fulfillListings(advancedOrders, swapInfo);
```

## Batch Transfer NFT Functions

### Check Fixed Fees
Check the amount of fixed fees charged by DIDHUB to use the smart contracts (zero at the moment)
```
const fixedFee = await sdk.transfer.getFixedFee();
```

### Check Approval
Batch Check whether the didhub contract is given the approval
```
const isApprovedForTransfer: boolean[] = await sdk.transfer.batchCheckApproval(domainInfos);
```

### Batch Make Approval
Batch make approval
```
await sdk.transfer.approveAllDomains(domainInfos);
```

### Batch Transfer
Batch transfer the domains to a newOwner
```
const transferTx = await sdk.transfer.batchTransfer(domainInfos, newOwner);
```

## Batch ENS Domain Management
Batch Manage the ENS Domain name

### Check Fixed Fees
Check the amount of fixed fees charged by DIDHUB to use the smart contracts (zero at the moment)
```
const fixedFee = await sdk.ens.getFixedFee();
```

### Batch Check Wraped Status
Check the wrap status: true is wrapped, and false is unwrapped
```
const wrapStatus = await sdk.ens.batchCheckWrapStatus(nameKeys);
```

### Batch Check Owner Status
Check the owner status of the unwrapped domain by calling ownerOf functions of the Base Imeplementation contract
```
const ownerStatus = await sdk.ens.batchCheckUnwrappedETH2LDOwnerStatus(nameKeys);
```

### Batch Check Name Wrapper Owner Status
Check the owner status of the wrapped domain by calling ownerOf functions of the Name Wrapper contract
```
const ownerStatus = await sdk.ens.batchCheckWrappedETH2LDOwnerStatus(nameKeys);
```

### Batch Check Approval 
Check whether the user has given approve to the DIDHUB contract for unwrapped domains
```
const isApprovedForWrap = await sdk.ens.batchCheckUnwrappedETH2LDApproval(nameKeys);
```

### Batch Check Name Wrapper Approval
Check whether the user has given approve to the DIDHUB contract for wrapped domains
```
const isApprovedForWrap = await sdk.ens.batchCheckWrappedETH2LDApproval(nameKeys);
```

### Batch Approve unwrapped domain
Approve the DIDHUB contract to operate on the unwrapped domains
```
const approvalTx = await sdk.ens.approveUnwrappedETH2LDDomains(nameKeys);
```

### Batch Approve wrapped domain
Approve the DIDHUB contract to operate on the wrapped domains
```
const approvalTx = await sdk.ens.approveWrappedETH2LDDomains();
```

### Batch Wrap 
Batch wrap the domain. Fee is paid internally
```
const wrapTx = await sdk.ens.batchWrap(nameKeys);
```

### Batch Unwrap 
Batch unwrap the domain. Fee is paid internally
```
const wrapTx = await sdk.ens.batchUnwrap(nameKeys);
```
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

# Usage

## Initalise SDK
```
const sdk = new DIDhubSDK(chain, secret, signer);
```
chain is the name of the supported blockchain. Supported chains are listed below \
| chain name | code |
| --- | --- |
| Binance Smart Chain | BNB |

secret is any 32 bytes hash. It creates uncertainly in the commit process. It is recommended to generate one for each user. \
signer, e.g. metamask signer

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

## Functions to interact with the DIDHUB batch registration contract

Please follow the following steps to purchase domains in bulk with the DIDHUB contract. See ./test/index.ts for a comphrensive flow of domain purchase.

### Check Domain Availability
```
const availabilityStatus = await sdk.register.batchCheckAvailability(domains);
```

### Check Commit Status
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
The return variable contains the followings \
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
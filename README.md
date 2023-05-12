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
chain is the name of the supported blockchain. Supported chains are listed below
| chain name | code |
| --- | --- |
| Binance Smart Chain | BNB |

secret is any 32 bytes hash. It creates uncertainly in the commit process. It is recommended to generate one for each user
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
domains is a list of domain information that contains the collectionInfo (${chain}:${contractAddress}),  nameKey, and duration.
margin is the slipage of the swap. Put 0 if you are certain that no token swap will take place
paymentToken is the token to pay for the 

## Check Domain Availability
```
const availabilityStatus = await sdk.register.batchCheckAvailability(domains);
```

## Check Commit Status
```
const commitmentStatus = await sdk.register.batchCheckCommitment(domains);
```

## Get Individual Price for the domain names
```
const individualPrices = await sdk.register.getIndividualPrice(domains);
```
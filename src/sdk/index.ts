import { ethers, providers } from "ethers";
import Web3 from "web3";

import { getBatchRegisterContract, BatchRegister } from "contracts/didhub";

import { batchRegistration } from "modules/batchRegister";
import { IBatchRegister } from "modules/batchRegister/type";


class DIDhubSDK {

    private web3: Web3;
    private ethersProvider: ethers.providers.Web3Provider;

    private batchRegisterContract: BatchRegister;

    public did: IBatchRegister;

    constructor(
        provider: Web3["currentProvider"],
        // apiConfig: DIDHubConfig = {},
        chain: string = "ETHEREUM",
        wallet?: ethers.Wallet
    ) {
        
        this.web3 = new Web3(provider);

        this.ethersProvider = new providers.Web3Provider(
            provider as providers.ExternalProvider
        );
        
        this.batchRegisterContract = getBatchRegisterContract(
            chain,
            this.ethersProvider
        );

        this.did = batchRegistration(this.batchRegisterContract);
    }

}

export { DIDhubSDK };
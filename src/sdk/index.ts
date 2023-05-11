import { ethers, providers } from "ethers";

import { getBatchRegisterContract, BatchRegister } from "contracts/didhub";

import { batchRegistration } from "modules/batchRegister";
import { IBatchRegister } from "modules/batchRegister/type";

class DIDhubSDK {

    private ethersProvider: ethers.providers.Web3Provider;

    private batchRegisterContract: BatchRegister;

    public did: IBatchRegister;
    
    public constructor(
        chain: string = "ETHEREUM",
        provider: any
    ) {

        this.ethersProvider = new providers.Web3Provider(provider as providers.ExternalProvider);
        
        this.batchRegisterContract = getBatchRegisterContract(
            chain,
            this.ethersProvider
        );
        
        this.did = batchRegistration(this.batchRegisterContract);
    }

}

export { DIDhubSDK };
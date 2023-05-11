import { ethers, providers } from "ethers";

import { getBatchRegisterContract, BatchRegister } from "contracts/didhub";

import { batchRegistration } from "modules/batchRegister";
import { IBatchRegister } from "modules/batchRegister/type";
import { IDIDhubSDK } from "./type";

class DIDhubSDK implements IDIDhubSDK {

    private ethersProvider: ethers.providers.Web3Provider;

    private batchRegisterContract: BatchRegister;

    private secret: string;

    public did: IBatchRegister;
    
    /**
     * @dev instantiate the didhub sdk
     * 
     * @param chain  the chain name, i.e. BSC, ETHEREUM
     * @param secret the secret a 32 bytes hex string
     * @param provider a signer that can sign and send transactions
     */
    public constructor(
        chain: string = "ETHEREUM",
        secret: string,
        provider: any
    ) {

        this.ethersProvider = new providers.Web3Provider(provider as providers.ExternalProvider);
        
        this.batchRegisterContract = getBatchRegisterContract(
            chain,
            this.ethersProvider
        );

        this.secret = secret;
        
        this.did = batchRegistration(
            this.batchRegisterContract,
            this.secret
        );
        
    }

}

export { DIDhubSDK };
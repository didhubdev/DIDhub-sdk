import { ethers, providers } from "ethers";

import { getBatchRegisterContract, BatchRegister } from "./contracts/didhub";

import { batchRegistration, IBatchRegister } from "./modules";
import { IDIDhubSDK } from "./type";

class DIDhubSDK implements IDIDhubSDK {

    private ethersProvider: ethers.providers.Web3Provider;

    private batchRegisterContract: BatchRegister;

    private secret: string;

    private did: IBatchRegister;

    /**
     * @dev instantiate the didhub sdk
     * 
     * @param chain  the chain name, i.e. BNB, ETHEREUM
     * @param secret the secret a 32 bytes hex string
     * @param provider a signer that can sign and send transactions
     */
    public constructor(
        chain: string = "BNB",
        secret: string,
        provider: any
    ) {

        // this.ethersProvider = new providers.Web3Provider(provider as providers.ExternalProvider);
        
        this.batchRegisterContract = getBatchRegisterContract(
            chain,
            provider as providers.ExternalProvider
        );

        this.secret = secret;
        
        this.did = batchRegistration(
            this.batchRegisterContract,
            this.secret
        );
        
    }


    get register(): IBatchRegister {
        return this.did as IBatchRegister;
    }

}

export { DIDhubSDK };

// export type
export * from "./modules/batchRegister/type";
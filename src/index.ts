import { ethers, providers, Signer } from "ethers";

import { batchRegistration, IBatchRegister, IOpensea, IUtils, openseaInit, utils } from "./modules";
import { IDIDhubSDK } from "./type";

import { Seaport as SeaportSDK } from "@opensea/seaport-js";

class DIDhubSDK implements IDIDhubSDK {

    public seaportSDK: InstanceType<typeof SeaportSDK>;

    private secret: string;

    private did: IBatchRegister;
    private seaport: IOpensea;
    public utilsWithProvider: IUtils;

    /**
     * @dev instantiate the didhub sdk
     * 
     * @param provider a signer that can sign and send transactions
     * @param {string} [secret] the secret a 32 bytes hex string
     */
    public constructor(
        provider: any,
        secret?: string
    ) {

        this.seaportSDK = new SeaportSDK(
            provider as providers.JsonRpcSigner
        )
        
        if (secret === undefined) {
            secret = this.getSecretFromCurrentTime();
        } else {
            this.checkSecretValidity(secret);
        }
        this.secret = secret;
        
        this.did = batchRegistration(
            provider as providers.JsonRpcSigner,
            this.secret
        );

        this.seaport = openseaInit(
            this.seaportSDK,
            provider as providers.JsonRpcSigner
        );

        this.utilsWithProvider = utils(
            provider as providers.JsonRpcSigner
        );
    }

    // get secret from current time
    public getSecretFromCurrentTime = (): string => {
        const now = Math.floor(Date.now() / 1000);
        const secret = ethers.utils.solidityKeccak256(
            ["uint256"],
            [now]
        );
        return secret;
    }

    // check secret validity to be bytes32
    public checkSecretValidity(secret: string) {
        const valid = ethers.utils.isBytesLike(secret) && ethers.utils.hexDataLength(secret) === 32;
        if (!valid) {
            throw Error("Secret must be in the form of bytes32 string");
        }
    }

    get register(): IBatchRegister {
        if (this.did === null) {
            throw Error("Batch register is only supported in BNB and ARBITRUM");
        }
        return this.did! as IBatchRegister;
    }

    get opensea(): IOpensea {
        return this.seaport! as IOpensea;
    }

    get utils(): IUtils {
        return this.utilsWithProvider! as IUtils;
    }

}

export { DIDhubSDK };

// export type
export * from "./modules/batchRegister/type";
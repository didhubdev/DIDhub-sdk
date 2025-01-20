import { BrowserProvider, JsonRpcSigner, Signer, isBytesLike, solidityPackedKeccak256 } from "ethers";

import { batchRegistration, IBatchRegister, IOpensea, IUtils, openseaInit, batchTransferInit, batchENSManagerInit, utils } from "./modules";
import { IDIDhubSDK } from "./type";

import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { IBatchTransfer } from "./modules/batchTransfer/type";
import { IBatchENSManager } from "./modules/batchENSManager/type";

class DIDhubSDK implements IDIDhubSDK {

    public seaportSDK: InstanceType<typeof SeaportSDK>;

    private secret: string;

    private did: IBatchRegister;
    private seaport: IOpensea;
    private batchTransfer: IBatchTransfer;
    private ensManager: IBatchENSManager;
    private environment: "production" | "dev";

    public utilsWithProvider: IUtils;
    
    /**
     * @dev instantiate the didhub sdk
     * 
     * @param provider a signer that can sign and send transactions
     * @param environment the environment to use, either production or dev, default to production
     * @param {string} [secret] the secret a 32 bytes hex string
     */
    public constructor(
        signer: JsonRpcSigner,
        environment: "production" | "dev" = "production",
        secret?: string
    ) {

        this.seaportSDK = new SeaportSDK(
            signer as any
        )
        
        if (secret === undefined) {
            secret = this.getSecretFromCurrentTime();
        } else {
            this.checkSecretValidity(secret);
        }
        this.secret = secret;
        
        this.did = batchRegistration(
            signer,
            this.secret
        );

        this.batchTransfer = batchTransferInit(
            signer as JsonRpcSigner
        );

        this.ensManager = batchENSManagerInit(
            signer as JsonRpcSigner
        );
        
        this.seaport = openseaInit(
            this.seaportSDK,
            signer as JsonRpcSigner,
            environment
        );

        this.utilsWithProvider = utils(
            signer as JsonRpcSigner
        );

        this.environment = environment;
    }

    // get secret from current time
    public getSecretFromCurrentTime = (): string => {
        const now = Math.floor(Date.now() / 1000);
        const secret = solidityPackedKeccak256(
            ["uint256"],
            [now]
        );
        return secret;
    }

    // check secret validity to be bytes32
    public checkSecretValidity(secret: string) {
        const valid = isBytesLike(secret) && secret.length === 32 * 2 + 2;
        if (!valid) {
            throw Error("Secret must be in the form of bytes32 string");
        }
    }

    get register(): IBatchRegister {
        if (this.did === null) {
            throw Error("Batch register is not yet supported in this network");
        }
        return this.did! as IBatchRegister;
    }

    get opensea(): IOpensea {
        if (this.seaport === null) {
            throw Error("Seaport operations is not yet supported in this network");
        }
        return this.seaport! as IOpensea;
    }

    get transfer(): IBatchTransfer {
        if (this.batchTransfer === null) {
            throw Error("Batch transfer operations is not yet supported in this network");
        }
        return this.batchTransfer! as IBatchTransfer;
    }
    
    get ens(): IBatchENSManager {
        if (this.ensManager === null) {
            throw Error("Batch ENS operations is not yet supported in this network");
        }
        return this.ensManager! as IBatchENSManager;
    }

    get utils(): IUtils {
        return this.utilsWithProvider! as IUtils;
    }

}

export { DIDhubSDK };

// export type
export * from "./modules/batchRegister/type";
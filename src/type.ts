import { IBatchRegister, IOpensea, IBatchTransfer, IBatchENSManager } from './modules';

export interface IDIDhubSDK {
    register: IBatchRegister;
    opensea: IOpensea;
    transfer: IBatchTransfer;
    ens: IBatchENSManager;
}
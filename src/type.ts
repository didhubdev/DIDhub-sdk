import { IBatchRegister, IOpensea } from './modules';

export interface IDIDhubSDK {
    register: IBatchRegister;
    opensea: IOpensea;
}
import { BatchRegister } from "./BSC/BatchRegister";
import { BatchRegister__factory } from "./BSC/BatchRegister__factory";
import { CONTRACTS } from "../../config";


export const getBatchRegisterContract = (chain: string, provider: any): BatchRegister => {
    // initialise batch register contract of a particular network
    switch (chain) {
        case "BSC":
            return new BatchRegister__factory(provider.getSigner()).attach(
                CONTRACTS.DIDHUB.BATCH_REGISTER.BSC
            );
        default:
            throw Error("Chain not supported");
    }
}

export { BatchRegister } from "./BSC/BatchRegister";
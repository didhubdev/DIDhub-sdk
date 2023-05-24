import { ZERO_ADDRESS } from "../../config";
import { 
    IOpenseaInit, 
    IOpensea,
    ItemType
} from "./type"

import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { Signer } from "ethers";

export const openseaInit: IOpenseaInit = (
    seaportSDK: InstanceType<typeof SeaportSDK>,
    signer: Signer
): IOpensea => {
    
    const getItemType = (
        contractAddress: string
    ): number => {
        if (contractAddress === ZERO_ADDRESS) {
            return ItemType.NATIVE;
        } else {
            return ItemType.ERC721;
        }
    }

    const listDomain = async (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string,
        endInDays: number
    ) => {

        const [chain, contractAddress, tokenIdDec] = domainInfo.split(":");

        const itemType = getItemType(contractAddress);
        const signerAddress = await signer.getAddress();

        const now = Math.floor(Date.now() / 1000);
        const startTime = now.toString();
        const endTime = (now + endInDays * 24 * 60 * 60).toString();

        const { executeAllActions } = await seaportSDK.createOrder(
            {
              offer: [
                {
                  itemType: itemType,
                  token: contractAddress,
                  identifier: tokenIdDec,
                },
              ],
              consideration: [
                {
                  amount: paymentAmount,
                  token: paymentToken,
                  recipient: signerAddress,
                },
              ],
              startTime: startTime,
              endTime: endTime
            },
            signerAddress
          );
        
        const order = await executeAllActions();
        order.parameters.conduitKey = "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";

        return order;
    }

    return {
        listDomain: listDomain
    }

}
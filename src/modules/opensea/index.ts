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
    ) => {

        const [chain, contractAddress, tokenIdDec] = domainInfo.split(":");

        const itemType = getItemType(contractAddress);
        const signerAddress = await signer.getAddress();

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
            },
            signerAddress
          );
        
        await executeAllActions();
    }

    return {
        listDomain: listDomain
    }

}
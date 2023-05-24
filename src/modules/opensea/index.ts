import { Fee } from "@opensea/seaport-js/lib/types";
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

    const getRoyalty = (
      chain: string,
      contractAddress: string
    ): Fee | null => {
      const collectionInfo = `${chain}:${contractAddress}`;
      switch (collectionInfo) {
        default:
          return null; 
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

        // split up into fee
        const openseaFee = 250;
        const openseaRecipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        let fees = [
          {
            basisPoints: openseaFee,
            recipient: openseaRecipient,
          }
        ]

        const itemRoyalty = getRoyalty(chain, contractAddress);
        if (itemRoyalty) {
          fees.push(itemRoyalty);
        }

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
              fees: fees,
              startTime: startTime,
              endTime: endTime,
              conduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000"
            },
            signerAddress
          );
        
        const order = await executeAllActions();

        return order;
    }

    return {
        listDomain: listDomain
    }

}
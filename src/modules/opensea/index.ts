import { Fee, OrderComponents, OrderWithCounter } from "@opensea/seaport-js/lib/types";
import { ZERO_ADDRESS } from "../../config";
import { 
    IOpenseaInit, 
    IOpensea,
    ItemType
} from "./type"

import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { ContractTransaction, Signer } from "ethers";
import { getOpenseaListingData, getOpenseaOfferData, getOrders, postOpenseaListingData, postOpenseaOfferData } from "../../api";

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
        const openseaRecipient = "0x0000a26b00c1f0df003000390027140000faa719";
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

        const data = await postOpenseaListingData(order, chain);
        
        return data;
    }
    
    const fulfillOrder = async (
      order: OrderWithCounter
    ): Promise<ContractTransaction> => {
      const signerAddress = await signer.getAddress();
      const { executeAllActions: executeAllFulfillActions } = await seaportSDK.fulfillOrder({
        order: order,
        accountAddress: signerAddress
      });
      const tx = await executeAllFulfillActions();
      return tx;
    }

    const fulfillListing = async (
      orderId: string
    ):Promise<ContractTransaction> => {  
      // fetch data from opensea
      const response = await getOpenseaListingData(orderId, await signer.getAddress());
      if (response.code !== 1) {
        throw new Error(response.message);
      }
      const order = response.data;
      return await fulfillOrder(order.fulfillment_data.orders[0].parameters);
    }

    const fulfillOffer = async (
      orderId: string
    ):Promise<ContractTransaction> => {  
      // fetch data from opensea
      const response = await getOpenseaOfferData(orderId, await signer.getAddress());
      if (response.code !== 1) {
        throw new Error(response.message);
      }
      const order = response.data;
      console.log(order.fulfillment_data.orders[0].parameters);
      return await fulfillOrder(order.fulfillment_data.orders[0].parameters);
    }

    const cancelOrders = async (
        orderIds: string[]
    ) => {
        const orderComponents = await getOrders(orderIds);
        const nonNullOrders = orderComponents.filter((order: any) => order !== null);
        if (nonNullOrders.length === 0) {
            throw new Error("No existing orders found");
        }
        const signerAddress = await signer.getAddress();
        const transaction = seaportSDK.cancelOrders(
          orderComponents,
            signerAddress
        );
        const tx = await transaction.transact();
        return tx;
    }


    const offerDomain = async (
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
      const openseaRecipient = "0x0000a26b00c1f0df003000390027140000faa719";
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
              amount: paymentAmount,
              token: paymentToken,
            },
          ],
          consideration: [
            {
              itemType: itemType,
              token: contractAddress,
              identifier: tokenIdDec,
              recipient: signerAddress,
            }
          ],
          fees: fees,
          startTime: startTime,
          endTime: endTime,
          conduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000"
        },
        signerAddress
      );
      
      const order = await executeAllActions();   
      
      const data = await postOpenseaOfferData(order, chain);

      return data;
    }

    return {
        listDomain: listDomain,
        offerDomain: offerDomain,
        fulfillListing: fulfillListing,
        fulfillOffer: fulfillOffer,
        cancelOrders: cancelOrders
    }

}
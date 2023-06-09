import { Fee, OrderWithCounter } from "@opensea/seaport-js/lib/types";
import { ZERO_ADDRESS } from "../../config";
import { 
    IOpenseaInit, 
    IOpensea,
    ItemType
} from "./type"

import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { ContractTransaction, providers, BigNumber, BigNumberish } from "ethers";
import { getOpenseaListingData, getOpenseaOfferData, getOrders, postOpenseaListingData, postOpenseaOfferData } from "../../api";
import { ERC20__factory, getBatchPurchaseContract } from "../../contracts";
import { AdvancedOrderStruct, FulfillmentComponentStruct, SwapInfoStruct, DomainPriceInfoStruct } from "../../contracts/didhub/batchPurchase/BatchPurchase";

export const openseaInit: IOpenseaInit = (
    seaportSDK: InstanceType<typeof SeaportSDK>,
    provider: providers.JsonRpcSigner
): IOpensea => {

    const fulfillerConduitKey = "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";
    
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
        const signerAddress = await provider.getAddress();

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
              conduitKey: seaportSDK.OPENSEA_CONDUIT_KEY
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
      const signerAddress = await provider.getAddress();
      const { executeAllActions: executeAllFulfillActions } = await seaportSDK.fulfillOrder({
        order,
        accountAddress: signerAddress
      });
      const tx = await executeAllFulfillActions();
      return tx;
    }

    const fetchOpenseaListingOrder = async (
      orderId: string
    ): Promise<OrderWithCounter> => {

      const response = await getOpenseaListingData(orderId, await provider.getAddress());
      if (response.code !== 1) {
        throw new Error(response.message);
      }
      const order = response.data;
      return order.fulfillment_data.orders[0];
    }

    const fulfillListing = async (
      orderId: string
    ):Promise<ContractTransaction> => {  
      // fetch data from opensea
      const orderWithCounter = await fetchOpenseaListingOrder(orderId);
      return await fulfillOrder(orderWithCounter);
    }

    const fulfillOffer = async (
      orderId: string
    ):Promise<ContractTransaction> => {  
      // fetch data from opensea
      const response = await getOpenseaOfferData(orderId, await provider.getAddress());
      if (response.code !== 1) {
        throw new Error(response.message);
      }
      const order = response.data;
      console.log(order.fulfillment_data.orders[0]);
      return await fulfillOrder(order.fulfillment_data.orders[0] as OrderWithCounter);
    }

    const getOfferFulfillmentData = (
      advancedOrders: AdvancedOrderStruct[]
    ): FulfillmentComponentStruct[] =>{
      let offerData: FulfillmentComponentStruct[] = [];
      for (let i = 0; i < advancedOrders.length; i++) {
        advancedOrders[i].parameters.offer.forEach((item, j)=>{
          offerData.push([{orderIndex: i, itemIndex: j}]);
        })
      }
      return offerData;
    }

    const getConsiderationFulfillmentData = (
      advancedOrders: AdvancedOrderStruct[]
    ): FulfillmentComponentStruct[]  => {
      let considerationData: FulfillmentComponentStruct[] = [];
      for (let i = 0; i < advancedOrders.length; i++) {
        advancedOrders[i].parameters.consideration.forEach((item, j)=>{
          considerationData.push([{orderIndex: i, itemIndex: j}]);
        })
      }
      return considerationData;
    }

    const getPriceInfo = (
      advancedOrders: AdvancedOrderStruct[]
    ): DomainPriceInfoStruct[] => {
      let priceInfo: DomainPriceInfoStruct[] = [];
      let priceMap = new Map<string, BigNumber>();
      for (let i = 0; i < advancedOrders.length; i++) {
        let totalPrice = BigNumber.from(0);
        advancedOrders[i].parameters.consideration.forEach((item, j)=>{
          totalPrice = totalPrice.add(BigNumber.from(item.startAmount));
        });
        let tokenContract = advancedOrders[i].parameters.consideration[0].token;
        if (priceMap.has(tokenContract)) { 
          priceMap.set(tokenContract, priceMap.get(tokenContract)!.add(totalPrice));
        } else {
          priceMap.set(tokenContract, totalPrice);
        }
      }
      // unwrap priceMap to priceInfo
      priceMap.forEach((value, key)=>{
        priceInfo.push({
          tokenContract: key,
          price: value.toString()
        });
      });
        
      return priceInfo;
    }

    const getSwapInfo = async (
      advancedOrders: AdvancedOrderStruct[],
      paymentToken: string,
      margin: number
    ): Promise<SwapInfoStruct> => {

      const batchPurchaseContract = await getBatchPurchaseContract(provider);

      const priceInfo = getPriceInfo(advancedOrders);

      const individualPrices = await batchPurchaseContract.callStatic.getIndividualPrice(priceInfo, paymentToken);

      let swapPrices = priceInfo.map((price) => {return {tokenContract: price.tokenContract, amountOut: price.price.toString(), amountInMax: ""}});
      let total = BigNumber.from(0);
      individualPrices.forEach((price, i) => {
          let priceWithMargin = price.mul(100 + margin).div(100);
          swapPrices[i].amountInMax = priceWithMargin.toString();
          total = total.add(priceWithMargin);
      });

      return {
        prices : swapPrices,
        paymentToken: paymentToken,
        paymentMax: total.toString()
      };
    }

    const getAdvancedOrders = async (
      orderIds: string[]
    ): Promise<AdvancedOrderStruct[]> => {
      let advancedOrders = [];
      
      for (let i = 0; i < orderIds.length; i++) {
        const orderWithCounter = await fetchOpenseaListingOrder(orderIds[i]);
        const {
          counter: counter,
          ...params
        } = orderWithCounter.parameters;

        advancedOrders.push({
          "parameters": params,
          "numerator": 1,
          "denominator": 1,
          "signature": orderWithCounter.signature,
          "extraData": "0x"
        });
      }
      return advancedOrders;
    }

    const fulfillListings = async (
      advancedOrders: AdvancedOrderStruct[],
      swapInfo: SwapInfoStruct
    ): Promise<ContractTransaction> => {

      const batchPurchaseContract = await getBatchPurchaseContract(provider);

      let tx; 
      if (swapInfo.paymentToken === ZERO_ADDRESS) {
        tx = await batchPurchaseContract.fulfillAvailableAdvancedOrders(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          swapInfo,
          fulfillerConduitKey,
          await provider.getAddress(),
          advancedOrders.length,
          {value: swapInfo.paymentMax}
        );
      } else {
        tx = await batchPurchaseContract.fulfillAvailableAdvancedOrdersERC20(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          swapInfo,
          fulfillerConduitKey,
          await provider.getAddress(),
          advancedOrders.length
        );
      }
      return tx;
    }

    const cancelOrders = async (
        orderIds: string[]
    ) => {
        const orderComponents = await getOrders(orderIds);
        const nonNullOrders = orderComponents.filter((order: any) => order !== null);
        if (nonNullOrders.length === 0) {
            throw new Error("No existing orders found");
        }
        const signerAddress = await provider.getAddress();
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
      const signerAddress = await provider.getAddress();

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
          conduitKey: seaportSDK.OPENSEA_CONDUIT_KEY
        },
        signerAddress
      );
      
      const order = await executeAllActions();   
      
      const data = await postOpenseaOfferData(order, chain);
      
      return data;
    }

    const approveERC20Tokens = async (
      paymentToken: string,
      paymentMax: BigNumberish
  ): Promise<ContractTransaction | null> => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      const signerAddress = await provider.getAddress();
      // attach ERC20 token to contract and create an instance of ERC20 contract
      const erc20Contract = new ERC20__factory(batchPurchaseContract.signer).attach(paymentToken);
      const allowance = await erc20Contract.allowance(signerAddress, batchPurchaseContract.address);
      if (allowance.lt(paymentMax)) {
          const tx = await erc20Contract.approve(batchPurchaseContract.address, paymentMax);
          return tx;
      }
      return null;
  }

    return {
        listDomain: listDomain,
        offerDomain: offerDomain,
        fulfillListing: fulfillListing,
        fulfillOffer: fulfillOffer,
        getAdvancedOrders: getAdvancedOrders,
        getSwapInfo: getSwapInfo,
        fulfillListings: fulfillListings,
        cancelOrders: cancelOrders,
        approveERC20Tokens: approveERC20Tokens
    }

}
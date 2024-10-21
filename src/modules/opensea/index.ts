import { CreateOrderInput, Fee, OrderWithCounter } from "@opensea/seaport-js/lib/types";
import { ZERO_ADDRESS } from "../../config";
import { 
    IOpenseaInit, 
    IOpensea,
    ItemType,
    IOrderRequestData,
    IOrderData
} from "./type"

import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { ContractTransaction, providers, BigNumber, BigNumberish } from "ethers";
import { getOpenseaListingData, getOpenseaOfferData, getOrders, postOpenseaListingData, postOpenseaOfferData } from "../../api";
import { getBatchPurchaseContract } from "../../contracts";
import { AdvancedOrderStruct, FulfillmentComponentStruct, SwapInfoStruct, DomainPriceInfoStruct, INFTStruct, IFTStruct, IOrderFulfillmentsStruct } from "../../contracts/didhub/batchPurchase/BatchPurchase";
import { utils as projectUtils } from "../utils";

export const openseaInit: IOpenseaInit = (
    seaportSDK: InstanceType<typeof SeaportSDK>,
    provider: providers.JsonRpcSigner,
    environment: "production" | "dev"
): IOpensea => {

    const USE_CACHE = true;

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

    const _getListingData = (
      domainInfo: string,
      paymentToken: string,
      paymentAmount: string,
      endInDays: number,
      signerAddress: string
    ) => {
      const [chain, contractAddress, tokenIdDec] = domainInfo.split(":");

      const itemType = getItemType(contractAddress);

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

      return {
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
      }
    }

    const listDomain = async (
        domainInfo: string,
        paymentToken: string,
        paymentAmount: string,
        endInDays: number
    ) => {
        const signerAddress = await provider.getAddress();
        const chain = domainInfo.split(":")[0];
        const listingData = _getListingData(domainInfo, paymentToken, paymentAmount, endInDays, signerAddress);

        const { executeAllActions } = await seaportSDK.createOrder(listingData, signerAddress);
        
        const order = await executeAllActions();
        const data = await postOpenseaListingData([order], chain, environment);
        
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

      const response = await getOpenseaListingData(orderId, await provider.getAddress(), USE_CACHE, environment);
      if (response.code !== 1) {
        throw new Error(response.message);
      }
      const order = response.data;
      return order.fulfillment_data.orders[0];
    }

    const fetchOpenseaOfferOrder = async (
      orderId: string
    ): Promise<IOrderData> => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      // the batch purchase contract is the intermediate step that receives the nft and deliver to the users
      const response = await getOpenseaOfferData(orderId, batchPurchaseContract.address, USE_CACHE, environment);
      if (response.code !== 1) {
        throw new Error(response.message);
      }
      const order = response.data;
      return {
        orderWithCounter: order.fulfillment_data.orders[0],
        extraData: order.fulfillment_data.transaction.input_data.orders ? order.fulfillment_data.transaction.input_data.orders[0].extraData : []
      };
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
      const response = await getOpenseaOfferData(orderId, await provider.getAddress(), USE_CACHE, environment);
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

    const getAdvancedListingOrders = async (
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

    const getAdvancedOfferOrders = async (
      orderIds: string[]
    ): Promise<AdvancedOrderStruct[]> => {
      let advancedOrders = [];
      
      for (let i = 0; i < orderIds.length; i++) {
        const {orderWithCounter, extraData} = await fetchOpenseaOfferOrder(orderIds[i]);
        const {
          counter: counter,
          ...params
        } = orderWithCounter.parameters;

        const offer = params.offer[0].endAmount;
        const fee = params.consideration[1].endAmount;
        const feePercentage = BigNumber.from(fee).mul(10000).div(BigNumber.from(offer)).toNumber();

        advancedOrders.push({
          "parameters": params,
          "numerator": 1,
          "denominator": 1,
          "signature": orderWithCounter.signature,
          "extraData": extraData,
          "fee": feePercentage
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
        tx = await batchPurchaseContract.fulfillAvailableAdvancedListingOrders(
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
        tx = await batchPurchaseContract.fulfillAvailableAdvancedListingOrdersERC20(
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

    const fulfillOffers = async (
      advancedOrders: AdvancedOrderStruct[]
    ): Promise<ContractTransaction> => {

      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      
      let fulfillmentItems: IOrderFulfillmentsStruct = {
        nftFullfillments: [],
        ftFullfillments: []
      }

      advancedOrders.forEach((order) => {
        order.parameters.consideration.forEach(c=> {
          if (c.itemType === ItemType.ERC20) {
            fulfillmentItems.ftFullfillments.push({
              tokenContract: c.token,
              amount: c.startAmount
            });
          } else if (c.itemType === ItemType.ERC721 || c.itemType === ItemType.ERC1155) {
            fulfillmentItems.nftFullfillments.push({
              tokenContract: c.token,
              tokenId: c.identifierOrCriteria
            });
          }
        })
      });

      let tx = await batchPurchaseContract.fulfillAvailableAdvancedOfferOrders(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          fulfillmentItems,
          fulfillerConduitKey,
          await provider.getAddress(),
          advancedOrders.length
        );

      // const seaportContract = await getSeaportContract(provider);
      // let tx = await seaportContract.fulfillAvailableAdvancedOrders(
      //   advancedOrders,
      //   [],
      //   getOfferFulfillmentData(advancedOrders),
      //   getConsiderationFulfillmentData(advancedOrders),
      //   fulfillerConduitKey,
      //   await provider.getAddress(),
      //   advancedOrders.length
      // );

      return tx;
    }

    const cancelOrders = async (
        orderIds: string[]
    ) => {
        const orderComponents = await getOrders(orderIds, environment);
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

    const bulkListDomain = async (
      orderRequestData: IOrderRequestData[],
    ) => {
      const signerAddress = await provider.getAddress();
      // ensure that all domains are from the same chain
      const chain = orderRequestData[0].domainInfo.split(":")[0];
      orderRequestData.forEach((order) => {
        if (chain != order.domainInfo.split(":")[0]) {
          throw new Error("All domains must be from the same chain");
        }
      });

      const listingData = orderRequestData.map((order) => {
        return _getListingData(order.domainInfo, order.paymentToken, order.paymentAmount, order.endInDays, signerAddress);
      });
      
      const { executeAllActions }  = await seaportSDK.createBulkOrders(
        listingData,
        signerAddress
      );
      
      const orders = await executeAllActions();
      const data = await postOpenseaListingData(orders, chain, environment);

      return data;
    }

    const _getOfferData = (
      domainInfo: string,
      paymentToken: string,
      paymentAmount: string,
      endInDays: number,
      signerAddress: string
    ): CreateOrderInput => {
      const [chain, contractAddress, tokenIdDec] = domainInfo.split(":");

      const itemType = getItemType(contractAddress);

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

      return {
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
      }
    }

    const bulkOfferDomain = async (
      orderRequestData: IOrderRequestData[],
    ) => {
      const signerAddress = await provider.getAddress();
      // ensure that all domains are from the same chain
      const chain = orderRequestData[0].domainInfo.split(":")[0];
      orderRequestData.forEach((order) => {
        if (chain != order.domainInfo.split(":")[0]) {
          throw new Error("All domains must be from the same chain");
        }
      });

      const offerData = orderRequestData.map((order) => {
        return _getOfferData(order.domainInfo, order.paymentToken, order.paymentAmount, order.endInDays, signerAddress);
      });
      
      const { executeAllActions }  = await seaportSDK.createBulkOrders(
        offerData,
        signerAddress
      );
      
      const orders = await executeAllActions();
      const data = await postOpenseaOfferData(orders, chain, environment);

      return data;
    }

    const offerDomain = async (
      domainInfo: string,
      paymentToken: string,
      paymentAmount: string,
      endInDays: number
    ) => {

      const signerAddress = await provider.getAddress();
      const chain = domainInfo.split(":")[0];
      const orderInput = _getOfferData(domainInfo, paymentToken, paymentAmount, endInDays, signerAddress);
      
      const { executeAllActions } = await seaportSDK.createOrder(orderInput,signerAddress);
      
      const order = await executeAllActions();
      const data = await postOpenseaOfferData([order], chain, environment);
      
      return data;
    }

    const batchCheckApprovalERC721orERC1155 = async (
      tokens: INFTStruct[]
    ) => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      const approvals = await batchPurchaseContract.batchCheckApprovalERC721orERC1155(tokens);
      return approvals;
    }

    const batchCheckApprovalERC20 = async (
      tokens: IFTStruct[]
    ) => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      const approvals = await batchPurchaseContract.batchCheckApprovalERC20(tokens);
      return approvals;
    }

    const approveERC721orERC1155Tokens = async (
      tokenAddress: string
    ): Promise<ContractTransaction | null> => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      const tx = await projectUtils(provider).approveAllERC721or1155Tokens(tokenAddress, batchPurchaseContract.address);
      return tx;
    }

    const approveERC20Tokens = async (
      tokenAddress: string,
      tokenAmount: BigNumberish
    ): Promise<ContractTransaction | null> => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      const tx = await projectUtils(provider).approveERC20Tokens(tokenAddress, batchPurchaseContract.address, tokenAmount);
      return tx;
    }

    // estimate gas ===========================================================

    const fulfillListingsEstimateGas = async (
      advancedOrders: AdvancedOrderStruct[],
      swapInfo: SwapInfoStruct
    ): Promise<BigNumber> => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      let price = await provider.getGasPrice();
      try {
        let estimatedGas = swapInfo.paymentToken === ZERO_ADDRESS ?
        await batchPurchaseContract.estimateGas.fulfillAvailableAdvancedListingOrders(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          swapInfo,
          fulfillerConduitKey,
          await provider.getAddress(),
          advancedOrders.length,
          {value: swapInfo.paymentMax}
        ) :
        await batchPurchaseContract.estimateGas.fulfillAvailableAdvancedListingOrdersERC20(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          swapInfo,
          fulfillerConduitKey,
          await provider.getAddress(),
          advancedOrders.length
        );
      return estimatedGas.mul(price);
      } catch {
        return BigNumber.from(0);
      }
    }

    const fulfillOffersEstimateGas = async (
      advancedOrders: AdvancedOrderStruct[]
    ): Promise<BigNumber> => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      
      let fulfillmentItems: IOrderFulfillmentsStruct = {
        nftFullfillments: [],
        ftFullfillments: []
      }
      advancedOrders.forEach((order) => {
        order.parameters.consideration.forEach(c=> {
          if (c.itemType === ItemType.ERC20) {
            fulfillmentItems.ftFullfillments.push({
              tokenContract: c.token,
              amount: c.startAmount
            });
          } else if (c.itemType === ItemType.ERC721 || c.itemType === ItemType.ERC1155) {
            fulfillmentItems.nftFullfillments.push({
              tokenContract: c.token,
              tokenId: c.identifierOrCriteria
            });
          }
        })
      });

      let price = await provider.getGasPrice();
      try {
        let estimatedGas = await batchPurchaseContract.estimateGas.fulfillAvailableAdvancedOfferOrders(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          fulfillmentItems,
          fulfillerConduitKey,
          await provider.getAddress(),
          advancedOrders.length
        );
      return estimatedGas.mul(price);
      } catch {
        return BigNumber.from(0);
      }
    }
    
    const approveERC721orERC1155TokensEstimateGas = async (
      tokenAddress: string
    ): Promise<BigNumber> => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      let price = await provider.getGasPrice();
      try {
        const estimatedGas = await projectUtils(provider).estimateGas.approveAllERC721or1155Tokens(tokenAddress, batchPurchaseContract.address);
        return estimatedGas.mul(price);
      } catch {
        return BigNumber.from(0);
      }
    }

    const approveERC20TokensEstimateGas = async (
      tokenAddress: string,
      tokenAmount: BigNumberish
    ): Promise<BigNumber> => {
      const batchPurchaseContract = await getBatchPurchaseContract(provider);
      let price = await provider.getGasPrice();
      try {
        const estimatedGas = await projectUtils(provider).estimateGas.approveERC20Tokens(tokenAddress, batchPurchaseContract.address, tokenAmount);
        return estimatedGas.mul(price);  
      } catch {
        return BigNumber.from(0);
      }
    }

    return {
        listDomain: listDomain,
        bulkListDomain: bulkListDomain,
        offerDomain: offerDomain,
        bulkOfferDomain: bulkOfferDomain,
        fulfillListing: fulfillListing,
        fulfillListings: fulfillListings,
        fulfillOffer: fulfillOffer,
        fulfillOffers: fulfillOffers,
        getAdvancedListingOrders: getAdvancedListingOrders,
        getAdvancedOfferOrders: getAdvancedOfferOrders,
        getSwapInfo: getSwapInfo,
        cancelOrders: cancelOrders,
        batchCheckApprovalERC721orERC1155: batchCheckApprovalERC721orERC1155,
        batchCheckApprovalERC20: batchCheckApprovalERC20,
        approveERC20Tokens: approveERC20Tokens,
        approveERC721orERC1155Tokens: approveERC721orERC1155Tokens,

        estimateGas: {
          fulfillListings: fulfillListingsEstimateGas,
          fulfillOffers: fulfillOffersEstimateGas,
          approveERC20Tokens: approveERC20TokensEstimateGas,
          approveERC721orERC1155Tokens: approveERC721orERC1155TokensEstimateGas
        }
    }

}
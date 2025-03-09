import { CreateOrderInput, Fee, OrderWithCounter } from "@opensea/seaport-js/lib/types";
import { ZERO_ADDRESS } from "../../config";
import { 
    IOpenseaInit, 
    IOpensea,
    ItemType,
    IOrderRequestData,
    IOrderData
} from "./type"

import { ContractTransaction, BigNumberish, JsonRpcSigner, AddressLike, ContractTransactionResponse, TransactionResponse } from "ethers";
import { getInvalidListings as getInvalidListingsAPI, getInvalidOffers as getInvalidOffersAPI, getOpenseaBasisPoints, getOpenseaListingData, getOpenseaOfferData, getOrders, getOrdersValidity, postOpenseaListingData, postOpenseaOfferData } from "../../api";
import { getBatchPurchaseContract } from "../../contracts";
import { Data, IFTStruct, INFTStruct, IOrderFulfillmentsStruct } from "../../contracts/didhub/batchPurchase/BatchPurchase";
import { utils as projectUtils } from "../utils";

import { Seaport as SeaportSDK } from "@opensea/seaport-js";
import { AdvancedOrderStruct, FulfillmentComponentStruct } from "@opensea/seaport-js/lib/typechain-types/seaport/contracts/Seaport";
import { ITokenInfo } from "modules/batchRegister/type";

export const openseaInit: IOpenseaInit = (
    seaportSDK: InstanceType<typeof SeaportSDK>,
    signer: JsonRpcSigner,
    environment: "production" | "dev"
): IOpensea => {

    const USE_CACHE = true;

    const fulfillerConduitKey = "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";
    
    const getItemType = (
        contractAddress: string
    ): number => {
        if (contractAddress === ZERO_ADDRESS) {
          return ItemType.NATIVE;
        } else if (
          contractAddress === "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401" ||
          contractAddress === "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401".toLowerCase()
        ) {
          return ItemType.ERC1155;
        }else {
          return ItemType.ERC721;
        }
    }

    const getRoyalty = (
      chain: string,
      contractAddress: string
    ): Fee | null => {
      const collectionInfo = `${chain}:${contractAddress}`;
      switch (collectionInfo) {
        // case "":
        //   return {}
        default:
          return null; 
      }
    }

    const _getListingData = (
      domainInfo: string,
      paymentToken: string,
      paymentAmount: string,
      endInSeconds: number,
      signerAddress: string,
      openseaBasisPoints: number
    ) => {
      const [chain, contractAddress, tokenIdDec] = domainInfo.split(":");

      const itemType = getItemType(contractAddress);

      const now = Math.floor(Date.now() / 1000);
      const startTime = now.toString();
      const endTime = (now + endInSeconds).toString();

      // split up into fee
      const openseaRecipient = "0x0000a26b00c1f0df003000390027140000faa719";
      let fees = [
        {
          basisPoints: openseaBasisPoints,
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
        endInSeconds: number
    ) => {
        const signerAddress = await signer.getAddress();
        const chain = domainInfo.split(":")[0];

        const openseaBasisPoints = await getOpenseaBasisPoints(environment);
        const listingData = _getListingData(domainInfo, paymentToken, paymentAmount, endInSeconds, signerAddress, openseaBasisPoints);

        const { executeAllActions } = await seaportSDK.createOrder(listingData, signerAddress);
        
        const order = await executeAllActions();
        const data = await postOpenseaListingData([order], chain, environment);
        
        return data;
    }
    
    const fulfillOrder = async (
      order: OrderWithCounter,
      receipentAddress: string
    ): Promise<ContractTransaction> => {
      const signerAddress = await signer.getAddress();
      const { executeAllActions: executeAllFulfillActions } = await seaportSDK.fulfillOrder({
        order,
        accountAddress: signerAddress,
        recipientAddress: receipentAddress
      });
      const tx = await executeAllFulfillActions();
      return tx;
    }

    const checkOrderValidity = async (
      orderIds: string[]
    ): Promise<boolean[]> => {
      const isValid = await getOrdersValidity(orderIds, environment);
      return isValid;
    }

    const fetchOpenseaListingOrder = async (
      orderId: string
    ): Promise<OrderWithCounter> => {

      const response = await getOpenseaListingData(orderId, await signer.getAddress(), USE_CACHE, environment);
      if (response.code !== 1) {
        throw new Error(response.message);
      }
      const order = response.data;
      return order.fulfillment_data.orders[0];
    }

    const fetchOpenseaOfferOrder = async (
      orderId: string
    ): Promise<IOrderData> => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      // the batch purchase contract is the intermediate step that receives the nft and deliver to the users
      const response = await getOpenseaOfferData(orderId, await batchPurchaseContract.getAddress(), USE_CACHE, environment);
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
      orderId: string,
      receipent?: string
    ):Promise<ContractTransaction> => {  
      // fetch data from opensea
      const orderWithCounter = await fetchOpenseaListingOrder(orderId);
      let receipentAddress = receipent ? receipent : await signer.getAddress();
      return await fulfillOrder(orderWithCounter, receipentAddress);
    }

    const fulfillOffer = async (
      orderId: string,
      receipent?: string
    ):Promise<ContractTransaction> => {  
      // fetch data from opensea
      const response = await getOpenseaOfferData(orderId, await signer.getAddress(), USE_CACHE, environment);
      if (response.code !== 1) {
        throw new Error(response.message);
      }
      const order = response.data;
      
      let receipentAddress = receipent ? receipent : await signer.getAddress();
      return await fulfillOrder(order.fulfillment_data.orders[0] as OrderWithCounter, receipentAddress);
    }

    const getOfferFulfillmentData = (
      advancedOrders: AdvancedOrderStruct[]
    ): FulfillmentComponentStruct[][] =>{
      let offerData: FulfillmentComponentStruct[][] = [];
      for (let i = 0; i < advancedOrders.length; i++) {
        advancedOrders[i].parameters.offer.forEach((item, j)=>{
          offerData.push([{orderIndex: i, itemIndex: j}]);
        })
      }
      return offerData;
    }

    const getConsiderationFulfillmentData = (
      advancedOrders: AdvancedOrderStruct[]
    ): FulfillmentComponentStruct[][]  => {
      let considerationData: FulfillmentComponentStruct[][] = [];
      for (let i = 0; i < advancedOrders.length; i++) {
        advancedOrders[i].parameters.consideration.forEach((item, j)=>{
          considerationData.push([{orderIndex: i, itemIndex: j}]);
        })
      }
      return considerationData;
    }

    const getPriceInfo = (
      advancedOrders: AdvancedOrderStruct[]
    ): Data.DomainPriceInfoStruct[] => {
      let priceInfo: Data.DomainPriceInfoStruct[] = [];
      let priceMap = new Map<AddressLike, bigint>();
      for (let i = 0; i < advancedOrders.length; i++) {
        let totalPrice = BigInt(0);
        advancedOrders[i].parameters.consideration.forEach((item, j)=>{
          totalPrice = totalPrice + BigInt(item.startAmount);
        });
        let tokenContract = advancedOrders[i].parameters.consideration[0].token;
        if (priceMap.has(tokenContract)) { 
          priceMap.set(tokenContract, priceMap.get(tokenContract)! + BigInt(totalPrice));
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
    ): Promise<Data.SwapInfoStruct> => {

      const batchPurchaseContract = await getBatchPurchaseContract(signer);

      const priceInfo = getPriceInfo(advancedOrders);

      const individualPrices = await batchPurchaseContract.getIndividualPrice.staticCall(priceInfo, paymentToken);

      let swapPrices = priceInfo.map((price) => {return {tokenContract: price.tokenContract, amountOut: price.price.toString(), amountInMax: ""}});
      let total = BigInt(0);
      individualPrices.forEach((price, i) => {
          let priceWithMargin = price * BigInt(100 + margin) / BigInt(100);
          swapPrices[i].amountInMax = priceWithMargin.toString();
          total = total + BigInt(priceWithMargin);
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
        const feePercentage = BigInt(fee) * BigInt(10000) / BigInt(offer);

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
      swapInfo: Data.SwapInfoStruct,
      receipent?: string
    ): Promise<ContractTransactionResponse> => {

      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      let receipentAddress = receipent ? receipent : await signer.getAddress();

      let tx; 
      if (swapInfo.paymentToken === ZERO_ADDRESS) {
        tx = await batchPurchaseContract.fulfillAvailableAdvancedListingOrders(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          swapInfo,
          fulfillerConduitKey,
          receipentAddress,
          advancedOrders.length,
          {value: swapInfo.paymentMax}
        );
      } else {

        // check approval
        const approveTx = await projectUtils(signer).approveERC20Tokens(swapInfo.paymentToken as string, await batchPurchaseContract.getAddress(), swapInfo.paymentMax);
        if (approveTx) {
          await approveTx.wait();
        }

        tx = await batchPurchaseContract.fulfillAvailableAdvancedListingOrdersERC20(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          swapInfo,
          fulfillerConduitKey,
          receipentAddress,
          advancedOrders.length
        );
      }
      return tx;
    }

    const fulfillOffers = async (
      advancedOrders: AdvancedOrderStruct[],
      receipent?: string
    ): Promise<ContractTransactionResponse> => {

      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      let receipentAddress = receipent ? receipent : await signer.getAddress();

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

      let tokenContracts = fulfillmentItems.nftFullfillments.map((item) => item.tokenContract);
      tokenContracts = [...new Set(tokenContracts)];
      
      // approve the tokenContracts
      for (let i = 0; i < tokenContracts.length; i++) {
        const approveTx = await projectUtils(signer).approveAllERC721or1155Tokens(tokenContracts[i] as string, await batchPurchaseContract.getAddress());
        if (approveTx) {
          await approveTx.wait();
        }
      }

      let tx = await batchPurchaseContract.fulfillAvailableAdvancedOfferOrders(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          fulfillmentItems,
          fulfillerConduitKey,
          receipentAddress,
          advancedOrders.length
        );

      return tx;
    }
    
    const getInvalidListings = async (
      domainInfo: string,
      paymentToken: string,
      paymentAmount: bigint
    ): Promise<string[]> => {
      const orderIds = await getInvalidListingsAPI(domainInfo, paymentToken, paymentAmount.toString(), environment);
      return orderIds;
    }

    const getInvalidOffers = async (
      domainInfo: string,
      paymentToken: string,
      paymentAmount: bigint
    ): Promise<string[]> => {
      const orderIds = await getInvalidOffersAPI(domainInfo, paymentToken, paymentAmount.toString(), environment);
      return orderIds;
    }

    const cancelInvalidListings = async (
      domainInfo: string,
      paymentToken: string,
      paymentAmount: bigint,
    ): Promise<TransactionResponse | null> => {
      
      // check in the database that any listings below the listing amount is invalid
      const orderIdsToCancel = await getInvalidListingsAPI(domainInfo, paymentToken, paymentAmount.toString(), environment);

      // cancel these orders
      if (orderIdsToCancel.length > 0) {
        const tx = await cancelOrders(orderIdsToCancel);
        return tx;
      }

      return null;
    }

    const cancelInvalidOffers = async (
      domainInfo: string,
      paymentToken: string,
      paymentAmount: bigint
    ): Promise<TransactionResponse | null> => {
      
      // check in the database that any listings below the listing amount is invalid
      const orderIdsToCancel = await getInvalidOffersAPI(domainInfo, paymentToken, paymentAmount.toString(), environment);

      // cancel these orders
      if (orderIdsToCancel.length > 0) {
        const tx = await cancelOrders(orderIdsToCancel);
        return tx;
      }

      return null; 
    }

    const cancelOrders = async (
        orderIds: string[]
    ): Promise<TransactionResponse> => {
        const orderComponents = await getOrders(orderIds, environment);
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

    const bulkListDomain = async (
      orderRequestData: IOrderRequestData[],
    ) => {
      const signerAddress = await signer.getAddress();
      // ensure that all domains are from the same chain
      const chain = orderRequestData[0].domainInfo.split(":")[0];
      
      orderRequestData.forEach((order) => {
        if (chain != order.domainInfo.split(":")[0]) {
          throw new Error("All domains must be from the same chain");
        }
      });

      // get basis points
      let openseaBasisPoints = await getOpenseaBasisPoints(environment);

      const listingData = orderRequestData.map((order) => {
        return _getListingData(order.domainInfo, order.paymentToken, order.paymentAmount, order.endInSeconds, signerAddress, openseaBasisPoints);
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
      endInSeconds: number,
      signerAddress: string,
      openseaBasisPoints: number
    ): CreateOrderInput => {
      const [chain, contractAddress, tokenIdDec] = domainInfo.split(":");

      const itemType = getItemType(contractAddress);

      const now = Math.floor(Date.now() / 1000);
      const startTime = now.toString();
      const endTime = (now + endInSeconds).toString();

      // split up into fee
      const openseaRecipient = "0x0000a26b00c1f0df003000390027140000faa719";
      let fees = [
        {
          basisPoints: openseaBasisPoints,
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
      const signerAddress = await signer.getAddress();
      // ensure that all domains are from the same chain
      const chain = orderRequestData[0].domainInfo.split(":")[0];
      orderRequestData.forEach((order) => {
        if (chain != order.domainInfo.split(":")[0]) {
          throw new Error("All domains must be from the same chain");
        }
      });

      const openseaBasisPoints = await getOpenseaBasisPoints(environment);

      const offerData = orderRequestData.map((order) => {
        return _getOfferData(order.domainInfo, order.paymentToken, order.paymentAmount, order.endInSeconds, signerAddress, openseaBasisPoints);
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
      endInSeconds: number
    ) => {

      const signerAddress = await signer.getAddress();
      const chain = domainInfo.split(":")[0];

      const openseaBasisPoints = await getOpenseaBasisPoints(environment);

      const orderInput = _getOfferData(domainInfo, paymentToken, paymentAmount, endInSeconds, signerAddress, openseaBasisPoints);
      
      const { executeAllActions } = await seaportSDK.createOrder(orderInput,signerAddress);
      
      const order = await executeAllActions();
      const data = await postOpenseaOfferData([order], chain, environment);
      
      return data;
    }

    const batchCheckApprovalERC721orERC1155 = async (
      tokens: INFTStruct[]
    ) => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      const approvals = await batchPurchaseContract.batchCheckApprovalERC721orERC1155(tokens);
      return approvals;
    }

    const batchCheckApprovalERC20 = async (
      tokens: IFTStruct[]
    ) => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      const approvals = await batchPurchaseContract.batchCheckApprovalERC20(tokens);
      return approvals;
    }

    const approveERC721orERC1155Tokens = async (
      tokenAddress: string
    ): Promise<ContractTransactionResponse | null> => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      const tx = await projectUtils(signer).approveAllERC721or1155Tokens(tokenAddress, await batchPurchaseContract.getAddress());
      return tx;
    }

    const approveERC20Tokens = async (
      tokenAddress: string,
      tokenAmount: BigNumberish
    ): Promise<ContractTransactionResponse | null> => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      const tx = await projectUtils(signer).approveERC20Tokens(tokenAddress, await batchPurchaseContract.getAddress(), tokenAmount);
      return tx;
    }

    const getSupportedOfferTokens = async (chain: string): Promise<ITokenInfo[]> => {
      switch (chain) {
          case "Ethereum":
            return [
              {
                name: "WETH",
                address: "ETHEREUM:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                decimals: 18,
                isNativeWrappedToken: true
              }
            ]
          case "Polygon":
            return [
                {
                    name: "WETH",
                    address: "POLYGON:0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
                    decimals: 18,
                    isNativeWrappedToken: false
                }
            ]
          case "Arbitrum":
            return [
                {
                    name: "WETH",
                    address: "ARBITRUM:0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
                    decimals: 18,
                    isNativeWrappedToken: true
                }
            ]
          case "Avalanche":
            return [
                {
                    name: "WAVAX",
                    address: "AVALANCHE:0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
                    decimals: 18,
                    isNativeWrappedToken: true
                }
            ]
          default:
              return [];
      }
  }

  const getSupportedListingTokens = async (chain: string): Promise<ITokenInfo[]> => {
    switch (chain) {
        case "Ethereum":
          return [
            {
              name: "ETH",
              address: `ETHEREUM:${ZERO_ADDRESS}`,
              decimals: 18,
              isNativeWrappedToken: false
            }
          ]
        case "Polygon":
          return [
              {
                name: "POL",
                address: `POLYGON:${ZERO_ADDRESS}`,
                decimals: 18,
                isNativeWrappedToken: false
              }
          ]
        case "Arbitrum":
          return [
              {
                  name: "ETH",
                  address: `ARBITRUM:${ZERO_ADDRESS}`,
                  decimals: 18,
                  isNativeWrappedToken: false
              }
          ]
        case "Avalanche":
          return [
              {
                  name: "AVAX",
                  address: `AVALANCHE:${ZERO_ADDRESS}`,
                  decimals: 18,
                  isNativeWrappedToken: false
              }
          ]
        default:
            return [];
    }
  }

  const getCreatorFee = async (project: string): Promise<number> => {
    switch (project) {
        // case "Freename":
        //   return 3;
        default:
            return 0;
    }
  }

  const getOpenseaFee = async (): Promise<number> => {
    const basisPoints = await getOpenseaBasisPoints(environment);
    return basisPoints / 100;
  }

  // estimate gas ===========================================================

    const fulfillListingsEstimateGas = async (
      advancedOrders: AdvancedOrderStruct[],
      swapInfo: Data.SwapInfoStruct
    ): Promise<bigint> => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      const feeData = await signer.provider.getFeeData();
      try {
        let estimatedGas = swapInfo.paymentToken === ZERO_ADDRESS ?
        await batchPurchaseContract.fulfillAvailableAdvancedListingOrders.estimateGas(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          swapInfo,
          fulfillerConduitKey,
          await signer.getAddress(),
          advancedOrders.length,
          {value: swapInfo.paymentMax}
        ) :
        await batchPurchaseContract.fulfillAvailableAdvancedListingOrdersERC20.estimateGas(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          swapInfo,
          fulfillerConduitKey,
          await signer.getAddress(),
          advancedOrders.length
        );
      return estimatedGas * feeData.gasPrice!;
      } catch {
        return BigInt(0);
      }
    }

    const fulfillOffersEstimateGas = async (
      advancedOrders: AdvancedOrderStruct[]
    ): Promise<bigint> => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      
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

      const feeData = await signer.provider.getFeeData();
      
      try {
        let estimatedGas = await batchPurchaseContract.fulfillAvailableAdvancedOfferOrders.estimateGas(
          advancedOrders,
          [],
          getOfferFulfillmentData(advancedOrders),
          getConsiderationFulfillmentData(advancedOrders),
          fulfillmentItems,
          fulfillerConduitKey,
          await signer.getAddress(),
          advancedOrders.length
        );
      return estimatedGas * feeData.gasPrice!;
      } catch {
        return BigInt(0);
      }
    }
    
    const approveERC721orERC1155TokensEstimateGas = async (
      tokenAddress: string
    ): Promise<bigint> => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      const feeData = await signer.provider.getFeeData();
      try {
        const estimatedGas = await projectUtils(signer).estimateGas.approveAllERC721or1155Tokens(tokenAddress, await batchPurchaseContract.getAddress());
        return estimatedGas * feeData.gasPrice!;
      } catch {
        return BigInt(0);
      }
    }

    const approveERC20TokensEstimateGas = async (
      tokenAddress: string,
      tokenAmount: BigNumberish
    ): Promise<bigint> => {
      const batchPurchaseContract = await getBatchPurchaseContract(signer);
      const feeData = await signer.provider.getFeeData();
      try {
        const estimatedGas = await projectUtils(signer).estimateGas.approveERC20Tokens(tokenAddress, await batchPurchaseContract.getAddress(), tokenAmount);
        return estimatedGas * feeData.gasPrice!;  
      } catch {
        return BigInt(0);
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
        getInvalidListings: getInvalidListings,
        getInvalidOffers: getInvalidOffers,
        cancelInvalidListings: cancelInvalidListings,
        cancelInvalidOffers: cancelInvalidOffers,
        cancelOrders: cancelOrders,
        batchCheckApprovalERC721orERC1155: batchCheckApprovalERC721orERC1155,
        batchCheckApprovalERC20: batchCheckApprovalERC20,
        approveERC20Tokens: approveERC20Tokens,
        approveERC721orERC1155Tokens: approveERC721orERC1155Tokens,
        checkOrderValidity: checkOrderValidity,

        getSupportedOfferTokens: getSupportedOfferTokens,
        getSupportedListingTokens: getSupportedListingTokens,

        getCreatorFee: getCreatorFee,
        getOpenseaFee: getOpenseaFee,

        estimateGas: {
          fulfillListings: fulfillListingsEstimateGas,
          fulfillOffers: fulfillOffersEstimateGas,
          approveERC20Tokens: approveERC20TokensEstimateGas,
          approveERC721orERC1155Tokens: approveERC721orERC1155TokensEstimateGas
        }
    }

}
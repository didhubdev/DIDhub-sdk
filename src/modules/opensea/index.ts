import { 
    IOpenseaInit, 
    IOpensea,
    OfferItem,
    ConsiderationItem,
    OrderComponents,
    orderType
} from "./type"
import { BigNumber, BigNumberish, Wallet } from "ethers"
import { randomBytes as nodeRandomBytes } from "crypto";
import { Seaport } from "contracts/seaport";

export const openseaInit: IOpenseaInit = async (
    seaportContract: Seaport
): Promise<IOpensea> => {
    
    const signer = seaportContract.signer;
    const chainId = await signer.getChainId();

    const domainData = {
        name: "Seaport",
        version: "1.5",
        chainId: chainId,
        verifyingContract: seaportContract.address,
    };

    const getAndVerifyOrderHash = async (orderComponents: OrderComponents) => {
        const orderHash = await seaportContract.getOrderHash(orderComponents);
        // const derivedOrderHash = calculateOrderHash(orderComponents);
        // expect(orderHash).to.equal(derivedOrderHash);
        return orderHash;
      };
    
    const signOrder = async (
        orderComponents: OrderComponents,
        signer: Wallet,
        // marketplace = marketplaceContract
      ) => {
        const signature = await signer._signTypedData(
          domainData,
          orderType,
          orderComponents
        );
    
        // const orderHash = await getAndVerifyOrderHash(orderComponents);
    
        // const { domainSeparator } = await marketplace.information();
        // const digest = keccak256(
        //   `0x1901${domainSeparator.slice(2)}${orderHash.slice(2)}`
        // );
        // const recoveredAddress = recoverAddress(digest, signature);
    
        // expect(recoveredAddress).to.equal(signer.address);
    
        return signature;
      };
    
    const hexRegex = /[A-Fa-fx]/g;
    const toHex = (n: BigNumberish, numBytes: number = 0) => {
        const asHexString = BigNumber.isBigNumber(n)
            ? n.toHexString().slice(2)
            : typeof n === "string"
            ? hexRegex.test(n)
            ? n.replace(/0x/, "")
            : Number(n).toString(16)
            : Number(n).toString(16);
        return `0x${asHexString.padStart(numBytes * 2, "0")}`;
    };
    const toBN = (n: BigNumberish) => BigNumber.from(toHex(n));
    const randomBytes = (n: number) => nodeRandomBytes(n).toString("hex");
    const randomHex = (bytes = 32) => `0x${randomBytes(bytes)}`;
    
    const createOrder = async (
        offerer: Wallet,
        zone: string,
        offer: OfferItem[],
        consideration: ConsiderationItem[],
        // criteriaResolvers?: CriteriaResolver[],
        startTime: number,
        endTime: number
      ) => {

        const counter = await seaportContract.getCounter(offerer.address);
    
        const salt = randomHex();
    
        const zoneHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const conduitKey = "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";
        const orderType = 0;
    
        const orderParameters = {
          offerer: offerer.address,
          zone: "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
          offer,
          consideration,
          totalOriginalConsiderationItems: consideration.length,
          orderType,
          zoneHash,
          salt,
          conduitKey,
          startTime,
          endTime,
        };
    
        const orderComponents = {
          ...orderParameters,
          counter,
        };
    
        const orderHash = await getAndVerifyOrderHash(orderComponents);
    
        const { isValidated, isCancelled, totalFilled, totalSize } =
          await seaportContract.getOrderStatus(orderHash);
    
        // expect(isCancelled).to.equal(false);
    
        const orderStatus = {
          isValidated,
          isCancelled,
          totalFilled,
          totalSize,
        };
    
        const flatSig = await signOrder(
          orderComponents,
          offerer
        );
    
        const order = {
          parameters: orderParameters,
          signature: flatSig,
          numerator: 1, // only used for advanced orders
          denominator: 1, // only used for advanced orders
          extraData: "0x", // only used for advanced orders
        };
    
        // How much ether (at most) needs to be supplied when fulfilling the order
        const value = offer
          .map((x) =>
            x.itemType === 0
              ? x.endAmount.gt(x.startAmount)
                ? x.endAmount
                : x.startAmount
              : toBN(0)
          )
          .reduce((a, b) => a.add(b), toBN(0))
          .add(
            consideration
              .map((x) =>
                x.itemType === 0
                  ? x.endAmount.gt(x.startAmount)
                    ? x.endAmount
                    : x.startAmount
                  : toBN(0)
              )
              .reduce((a, b) => a.add(b), toBN(0))
          );
    
        return {
          order,
          orderHash,
          value,
          orderStatus,
          orderComponents,
          startTime,
          endTime,
        };
      };

    return {

    }

}
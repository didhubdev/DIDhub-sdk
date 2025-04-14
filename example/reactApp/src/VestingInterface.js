// VestingInterface.js

import React, { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';

import { DIDhubSDK } from '@didhubdev/sdk';

// import env
import dotenv from 'dotenv';

import {
  Box,
  Button,
  Heading,
  Table,
  Tbody,
  Td,
  Tr,
  Center,
  Input
} from '@chakra-ui/react';

dotenv.config();

function VestingInterface() {

  const [chain, setChain] = useState("POLYGON");
  const [orderId, setOrderId] = useState("OPENSEA:0x1b2116948817ce8caae88904a9c0a4e66ce6ea604d366f22eb7e02d41859f0a6");
  const [receipent, setReceipent] = useState(); 
  const [tokenAddress, setTokenAddress] = useState("0xe7e7ead361f3aacd73a61a9bd6c10ca17f38e945");
  const [tokenId, setTokenId] = useState("28453079821991126401685168973131321967874107147748814493140467641252827572009");
  const [amount, setAmount] = useState();
  const [paymentToken, setPaymentToken] = useState("0x0000000000000000000000000000000000000000");

  const [orderId2, setOrderId2] = useState();
  const [tokenAddress2, setTokenAddress2] = useState("0xe7e7ead361f3aacd73a61a9bd6c10ca17f38e945");
  const [tokenId2, setTokenId2] = useState("58870960196819387276912420065978610371126417477681201313179941299885900374123");
  const [amount2, setAmount2] = useState();

  const [sdk, setSdk] = useState();
  const [signer, setSigner] = useState();
  const [address, setAddress] = useState();

  useEffect(() => {
    const metamask = window.ethereum;
    const provider = new BrowserProvider(metamask);
    provider.getSigner().then((signer) => {
      signer.getAddress().then((address) => {
        setSigner(signer);
        setAddress(address);
      });
      const sdk = new DIDhubSDK(
        signer,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      setSdk(sdk);
    })
  });


  const fulfillOffers = async () => {

    if (!sdk) return;

    if (!orderId) return;

    const receipentAddress = receipent || address;

    if (!orderId2) {
      const tx = await sdk.opensea.fulfillOffer(
        orderId,
        receipentAddress
      );
      const data = await tx.wait();
      return;
    }

    const advancedOrders = await sdk.opensea.getAdvancedOfferOrders(
      [orderId, orderId2]
    );

    let tokensToTransfer = advancedOrders.map((order) => {
        const token = order.parameters.consideration.filter(c=>c.itemType == 2)[0];
        return {
          tokenContract: token.token,
          tokenId: token.identifierOrCriteria,
        };
    });
    console.log(advancedOrders);

    // make approvals
    const approvals = await sdk.opensea.batchCheckApprovalERC721orERC1155(tokensToTransfer);
    console.log("Approvals", approvals);

    // get tokens that are not approved
    const tokensToApprove = tokensToTransfer.filter((t, i) => !approvals[i]);

    // approve tokens
    for (const token of tokensToApprove) {
      const approveTx = await sdk.opensea.approveERC721orERC1155Tokens(token.tokenContract);
      if (approveTx) await approveTx.wait();
      console.log(`Approved ERC721/1155 Tokens`);
    }

    console.log("fulfilling");
    
    const tx = await sdk.opensea.fulfillOffers(
      advancedOrders,
      tokensToTransfer,
      receipent
    );

    const data = await tx.wait();
    console.log(data);
  };

  const fulfillListingGasEst = async () => {

    const receipentAddress = receipent || address;

    const advancedOrders = await sdk.opensea.getAdvancedListingOrders(
      [orderId, orderId2]
    );

    const swapInfo = await sdk.opensea.getSwapInfo(advancedOrders, paymentToken, 3);
    
    const gas = await sdk.opensea.estimateGas.fulfillListings(
        advancedOrders,
        swapInfo,
        receipentAddress
    );
    console.log(gas);
  };

  const fulfillListing = async () => {

    const receipentAddress = receipent || address;

    const advancedOrders = await sdk.opensea.getAdvancedListingOrders(
      [orderId, orderId2]
    );

    console.log(advancedOrders);

    const swapInfo = await sdk.opensea.getSwapInfo(advancedOrders, paymentToken, 3);

    // const gas = await sdk.opensea.estimateGas.fulfillListings(
    //   advancedOrders,
    //   swapInfo,
    //   receipentAddress
    // );
    // console.log("Gas", gas);
    
    console.log("Receipent", receipent);
    const tx = await sdk.opensea.fulfillListings(
        advancedOrders,
        swapInfo,
        receipentAddress
    );
    const data = await tx.wait();
    console.log(data);
  };

  const signOffer = async () => {
      console.log(tokenAddress, tokenId, paymentToken, amount);
      const domainInfo = `${chain}:${tokenAddress}:${tokenId}`;

      const firstOfferData = {
        domainInfo: domainInfo,
        paymentToken: paymentToken,
        paymentAmount: amount,
        endInSeconds: 3 * 60 * 60
      };

      const secondOfferData = tokenAddress2 && tokenId2 && amount2 ? {
        domainInfo: `${chain}:${tokenAddress2}:${tokenId2}`,
        paymentToken: paymentToken,
        paymentAmount: amount2,
        endInSeconds: 3 * 60 * 60
      } : null;

    if (secondOfferData != null) {
      console.log("bulk offer domain")
      const data = await sdk.opensea.bulkOfferDomain(
        [firstOfferData, secondOfferData]
      );
      console.log(data);
    } else {
      console.log("single domain", domainInfo, paymentToken, amount);
      const data = await sdk.opensea.offerDomain(
        domainInfo,
        paymentToken,
        amount,
        3 * 60 * 60
      );
      console.log(data);  
    };
  };

  const signListing = async () => {
    console.log(tokenAddress, tokenId, paymentToken, amount);
    const domainInfo = `${chain}:${tokenAddress}:${tokenId}`;
    const firstListingData = {
      domainInfo: domainInfo,
      paymentToken: paymentToken,
      paymentAmount: amount,
      endInSeconds: 3 * 60 * 60
    };
    const secondListingData = tokenAddress2 && tokenId2 && amount2 ? {
      domainInfo: `${chain}:${tokenAddress2}:${tokenId2}`,
      paymentToken: paymentToken,
      paymentAmount: amount2,
      endInSeconds: 3 * 60 * 60
    } : null;

    if (secondListingData != null) {
      const data = await sdk.opensea.bulkListDomain(
        [firstListingData, secondListingData]
      );
      console.log(data);
    } else {
      const data = await sdk.opensea.listDomain(
        domainInfo,
        paymentToken,
        amount,
        3 * 60 * 60
      );
      console.log(data);  
    }

  };

  const cancelOrder = async () => {
    console.log(`Cancelling order ${orderId}`);
    const tx = await sdk.opensea.cancelOrders(
      [orderId]
    );
    const data = await tx.wait();
    console.log(data);
  }
  
  return (
     <Box>

      <Heading size="ml" mb={5} textAlign="center">
        Test Opensea
      </Heading>
      
      <Table
        variant="simple"
        size="ml"
        borderRadius="12px"
        borderWidth="1px"
        style={{ borderCollapse: 'initial', tableLayout: 'fixed' }}
      >
        <Tbody>

        <Tr>
            <Td>
              <strong>Chain</strong>
            </Td>
            <Td>
              <Input
                value={chain}
                onChange={(event)=>setChain(event.target.value)}
                defaultValue="">
              </Input>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Payment Token</strong>
            </Td>
            <Td>
              <Input
                value={paymentToken}
                onChange={(event)=>setPaymentToken(event.target.value)}
                defaultValue="">
              </Input>
            </Td>
          </Tr>

          <Tr> FIRST ITEM </Tr>

          <Tr>
            <Td>
              <strong>Token Address</strong>
            </Td>
            <Td>
              <Input
                value={tokenAddress}
                onChange={(event)=>setTokenAddress(event.target.value)}
                defaultValue="">
              </Input>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Token Id</strong>
            </Td>
            <Td>
              <Input
                value={tokenId}
                onChange={(event)=>setTokenId(event.target.value)}
                defaultValue="">
              </Input>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>OrderId</strong>
            </Td>
            <Td>
              <Input
                value={orderId}
                onChange={(event)=>setOrderId(event.target.value)}
                defaultValue="">
              </Input>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Amount</strong>
            </Td>
            <Td>
              <Center>
              <Input
                value={amount}
                onChange={(event)=>setAmount(event.target.value)}
                defaultValue="">
              </Input>
              </Center>
            </Td>
          </Tr>

          <Tr> SECOND ITEM </Tr>

          <Tr>
            <Td>
              <strong>Token Address 2</strong>
            </Td>
            <Td>
              <Input
                value={tokenAddress2}
                onChange={(event)=>setTokenAddress2(event.target.value)}
                defaultValue="">
              </Input>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Token Id 2</strong>
            </Td>
            <Td>
              <Input
                value={tokenId2}
                onChange={(event)=>setTokenId2(event.target.value)}
                defaultValue="">
              </Input>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>OrderId 2</strong>
            </Td>
            <Td>
              <Input
                value={orderId2}
                onChange={(event)=>setOrderId2(event.target.value)}
                defaultValue="">
              </Input>
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Amount 2</strong>
            </Td>
            <Td>
              <Center>
              <Input
                value={amount2}
                onChange={(event)=>setAmount2(event.target.value)}
                defaultValue="">
              </Input>
              </Center>
            </Td>
          </Tr>
          
          <Tr> RECEIPENT </Tr>

          <Tr>
            <Td>
              <strong>Receipent</strong>
            </Td>
            <Td>
              <Center>
              <Input
                value={receipent}
                onChange={(event)=>setReceipent(event.target.value)}
                defaultValue="">
              </Input>
              </Center>
            </Td>
          </Tr>


          <Tr>
            <Td>
              <Button
                onClick={signOffer}
                colorScheme="green"
                ml={6}
                isDisabled={false}
              >
                Sign Offer
              </Button>
            </Td>
            <Td>
              <Button
                onClick={signListing}
                colorScheme="green"
                ml={5}
                isDisabled={false}
              >
                Sign Listing
              </Button>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Button
                onClick={fulfillOffers}
                colorScheme="green"
                ml={6}
                isDisabled={false}
              >
                Fulfill Offer
              </Button>
            </Td>
            <Td>
              <Button
                onClick={fulfillListing}
                colorScheme="green"
                ml={5}
                isDisabled={false}
              >
                Fulfill Listing
              </Button>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Button
                onClick={cancelOrder}
                colorScheme="green"
                ml={6}
                isDisabled={false}
              >
                Cancel Order
              </Button>
            </Td>
            <Td>
              <Button
                onClick={fulfillListingGasEst}
                colorScheme="green"
                ml={6}
                isDisabled={false}
              >
                Gas Price
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}

export default VestingInterface;

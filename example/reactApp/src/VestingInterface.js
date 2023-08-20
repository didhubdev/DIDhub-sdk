// VestingInterface.js

import React, { useState } from 'react';
import { ethers } from 'ethers';

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

  const [chain, setChain] = useState("ARBITRUM");
  const [orderId, setOrderId] = useState();
  const [tokenAddress, setTokenAddress] = useState("0x5d482d501b369f5ba034dec5c5fb7a50d2d6ca20");
  const [tokenId, setTokenId] = useState("52492076887691664011327311101779585587025155497779924969137510609172948393659");
  const [amount, setAmount] = useState();
  const [paymentToken, setPaymentToken] = useState("0x0000000000000000000000000000000000000000");

  const [orderId2, setOrderId2] = useState();
  const [tokenAddress2, setTokenAddress2] = useState("0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6");
  const [tokenId2, setTokenId2] = useState("62989861101794962219924061081957215181955279530765526469477249127872642808190");
  const [amount2, setAmount2] = useState();

  const metamask = window.ethereum;

  const provider = new ethers.providers.Web3Provider(metamask);
  const signer = provider.getSigner();
  const sdk = new DIDhubSDK(
    signer,
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  const fulfillOffer = async () => {
    // const tx = await sdk.opensea.fulfillOffer(
    //   orderId
    // );
    // const data = await tx.wait();
    // console.log(data);

    const advancedOrders = await sdk.opensea.getAdvancedOfferOrders(
      [orderId]
    );

    let tokensToTransfer = advancedOrders.map((order) => {
        const token = order.parameters.consideration.filter(c=>c.itemType == 2)[0];
        return {
          tokenContract: token.token,
          tokenId: token.identifierOrCriteria,
        };
    });
    console.log(tokensToTransfer);

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

    const tx = await sdk.opensea.fulfillOffers(
      advancedOrders,
      tokensToTransfer
    );

    const data = await tx.wait();
    console.log(data);
  };


  const fulfillListing = async () => {
    const tx = await sdk.opensea.fulfillListing(
      orderId
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
        endInDays: 3
      };

      const secondOfferData = tokenAddress2 && tokenId2 && amount2 ? {
        domainInfo: `${chain}:${tokenAddress2}:${tokenId2}`,
        paymentToken: paymentToken,
        paymentAmount: amount2,
        endInDays: 3
      } : null;

    if (secondOfferData != null) {
      const data = await sdk.opensea.bulkOfferDomain(
        [firstOfferData, secondOfferData]
      );
      console.log(data);
    } else {
      const data = await sdk.opensea.offerDomain(
        domainInfo,
        paymentToken,
        amount,
        3
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
      endInDays: 3
    };
    const secondListingData = tokenAddress2 && tokenId2 && amount2 ? {
      domainInfo: `${chain}:${tokenAddress2}:${tokenId2}`,
      paymentToken: paymentToken,
      paymentAmount: amount2,
      endInDays: 3
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
        3
      );
      console.log(data);  
    }

  };

  const cancelOrder = async () => {
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
                onClick={fulfillOffer}
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
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}

export default VestingInterface;

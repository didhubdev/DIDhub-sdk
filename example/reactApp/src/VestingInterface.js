// VestingInterface.js

import React, { useEffect, useState } from 'react';
import moment from 'moment';

import { abbreviateAddress } from './utils';
import { EXPLORER_URL } from './config';
import { ethers } from 'ethers';
import { ecsign } from 'ethereumjs-util'

import {
  hexlify,
} from 'ethers/lib/utils';

import { DIDhubSDK } from '@didhubdev/sdk';
import fetch from 'node-fetch';

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
  Link,
  Center,
  NumberInput,
  NumberInputField,
  Text,
  Input
} from '@chakra-ui/react';

dotenv.config();

function VestingInterface() {

  const [chain, setChain] = useState("BNB");
  const [orderId, setOrderId] = useState();
  const [tokenAddress, setTokenAddress] = useState("0xe3b1d32e43ce8d658368e2cbff95d57ef39be8a6");
  const [tokenId, setTokenId] = useState("62989861101794962219924061081957215181955279530765526469477249127872642808190");
  const [amount, setAmount] = useState();

  const [isClaiming, setIsClaiming] = useState(false);

  const metamask = window.ethereum;

  const provider = new ethers.providers.Web3Provider(metamask);
  const signer = provider.getSigner();
  const initChain = "POLYGON";
  const sdk = new DIDhubSDK(
    initChain,
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    signer
  );

  // const paymentToken = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
  const paymentToken = "0x0000000000000000000000000000000000000000"

  const fulfillOffer = async () => {
    const tx = await sdk.opensea.fulfillOffer(
      orderId
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
      const chain = initChain;
      const domainInfo = `${chain}:${tokenAddress}:${tokenId}`;
      const data = await sdk.opensea.offerDomain(
        domainInfo,
        paymentToken,
        amount,
        3
      );
      console.log(data);
  };

  const signListing = async () => {
    console.log(tokenAddress, tokenId, paymentToken, amount);
    const chain = initChain ;
    const domainInfo = `${chain}:${tokenAddress}:${tokenId}`;
    const data = await sdk.opensea.listDomain(
      domainInfo,
      paymentToken,
      amount,
      3
    );
    console.log(data);
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

          <Tr>
            <Td>
              <Button
                onClick={signOffer}
                colorScheme="green"
                ml={6}
                isDisabled={isClaiming}
              >
                Sign Offer
              </Button>
            </Td>
            <Td>
              <Button
                onClick={signListing}
                colorScheme="green"
                ml={5}
                isDisabled={isClaiming}
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
                isDisabled={isClaiming}
              >
                Fulfill Offer
              </Button>
            </Td>
            <Td>
              <Button
                onClick={fulfillListing}
                colorScheme="green"
                ml={5}
                isDisabled={isClaiming}
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
                isDisabled={isClaiming}
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

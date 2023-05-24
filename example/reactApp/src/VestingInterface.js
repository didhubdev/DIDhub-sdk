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

function VestingInterface() {

  const [tokenAddress, setTokenAddress] = useState();
  const [tokenId, setTokenId] = useState();
  const [amount, setAmount] = useState();

  const [signerAddress, setSignerAddress] = useState();
  const [spenderAddress, setSpenderAddress] = useState();
  const [accountState, setAccountState] = useState({'balance': 0, 'symbol': 'BTIEPT', 'nonce': 0});
  const [signedTransactionState, setSignedTransactionState] = useState({});
  const [isClaiming, setIsClaiming] = useState(false);

  const metamask = window.ethereum;

  const provider = new ethers.providers.Web3Provider(metamask);
  const signer = provider.getSigner();
  const sdk = new DIDhubSDK(
    "BNB",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    signer
  );

  const signTransaction = async () => {
    
  };

  return (
     <Box>

      <Heading size="md" mb={5} textAlign="center">
        Test meta transaction
      </Heading>
      
      <Table
        variant="simple"
        size="md"
        borderRadius="12px"
        borderWidth="1px"
        style={{ borderCollapse: 'initial', tableLayout: 'fixed' }}
      >
        <Tbody>
          <Tr>
            <Td>
              <strong>Token Contract Address</strong>
            </Td>
            <Td>
              <Link
                color="teal.500"
                href={`${EXPLORER_URL}/address/${sdk.seaportContract.address}`}
                isExternal
              >
                {abbreviateAddress(sdk.seaportContract.address)}
              </Link>
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
              <strong>Signature</strong>
            </Td>
            <Td>

            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Available to Sell</strong>
            </Td>
            <Td>
              <Center>
              {`${accountState.balance}`}
              </Center>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Amount to List</strong>
            </Td>
            <Td>
              <Center>
              <NumberInput
                value={amount}
                onChange={(valueString)=>setAmount(valueString)}
                defaultValue={0}>
                  <NumberInputField />
              </NumberInput>
              </Center>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Grant to Address</strong>
            </Td>
            <Td>
              <Input value={spenderAddress} onChange={(event)=>setSpenderAddress(event.target.value)}/>
            </Td>
          </Tr>
          <Tr>
            <Td>
            </Td>
            <Td>
              <Button
                onClick={signTransaction}
                colorScheme="green"
                ml={5}
                isDisabled={isClaiming}
              >
                Sign Transaction
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}

export default VestingInterface;

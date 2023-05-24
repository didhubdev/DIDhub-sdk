// VestingInterface.js

import React, { useEffect, useState } from 'react';
import moment from 'moment';

import { abbreviateAddress, formatTokenNum } from './utils';
import { EXPLORER_URL } from './config';
import { createPermitMessageData, getApprovalDigest } from './utils';
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

  const [amountTransfer, setAmountTransfer] = useState();
  const [signerAddress, setSignerAddress] = useState();
  const [spenderAddress, setSpenderAddress] = useState();
  const [accountState, setAccountState] = useState({'balance': 0, 'symbol': 'BTIEPT', 'nonce': 0});
  const [signedTransactionState, setSignedTransactionState] = useState({});
  const [isClaiming, setIsClaiming] = useState(false);

  const metamask = window.ethereum;

  const provider = new ethers.providers.Web3Provider(metamask);
  const sdk = new DIDhubSDK({
    provider: provider,
    chainId: 56,
  });

  useEffect(() => {
    // getData();
    const interval = setInterval(getData, 5000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const signData = async (fromAddress, typeData) => {
  //   return new Promise(function (resolve, reject) {

  //     const provider = new ethers.providers.Web3Provider(metamask);
  //     const signer = provider.getSigner();
      
  //     metamask.sendAsync(
  //       {
  //         id: 1,
  //         method: "eth_signTypedData_v3",
  //         params: [fromAddress, typeData],
  //         from: fromAddress,
  //       },
  //       function (err, result) {
  //         if (err) {
  //           reject(err); //TODO
  //           setIsClaiming(false);
  //         } else {
  //           const r = result.result.slice(0, 66);
  //           const s = "0x" + result.result.slice(66, 130);
  //           const v = Number("0x" + result.result.slice(130, 132));
  //           resolve({
  //             v,
  //             r,
  //             s,
  //           });
  //         }
  //       }
  //     );
  //   });
  // };

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
              <strong>Signed Transaction Owner</strong>
            </Td>
            <Td>
              {signedTransactionState.owner
                ? signedTransactionState.owner
                : 'loading...'}
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Signed Transaction Spender</strong>
            </Td>
            <Td>
              {signedTransactionState.spender
                ? signedTransactionState.spender
                : 'loading...'}
            </Td>
          </Tr>

          <Tr>
            <Td>
              <strong>Signed Transaction Value</strong>
            </Td>
            <Td>
              {signedTransactionState.value ? 
                signedTransactionState.value + " " + accountState.symbol
                : 'loading...'
              }
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Signed Transaction Deadline</strong>
            </Td>
            <Td>
              {signedTransactionState.deadline
                ? <Box>
                  <Text>{moment(
                    (signedTransactionState.deadline)
                  ).format('YYYY/MM/DD HH:mm')}</Text>
                  <Text>{"Stamp: " + signedTransactionState.deadline}</Text>
                  </Box>
                : 'loading...'}
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>R, S, V</strong>
            </Td>
            <Td>
              {signedTransactionState.r
                ? <Box>
                    <Text>{"R: " + signedTransactionState.r}</Text>
                    <Text>{"\nS: " + signedTransactionState.s}</Text>
                    <Text>{"\n V: " + signedTransactionState.v}</Text>
                  </Box>
                : 'loading...'}
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Available to Permit</strong>
            </Td>
            <Td>
              <Center>
              {`${accountState.balance} ${accountState.symbol}`}
              </Center>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <strong>Amount to Permit</strong>
            </Td>
            <Td>
              <Center>
              <NumberInput
                value={amountTransfer}
                onChange={(valueString)=>setAmountTransfer(valueString)}
                defaultValue={0}>
                  <NumberInputField />
              </NumberInput>
              </Center>
              {parseInt(amountTransfer === "" ? "0" : amountTransfer, 10) > parseInt(accountState.balance, 10) ?
              (<Text fontSize="xs" color="red.400" fontWeight="bold">Amount is greater than balance!</Text>) : <Text/>
              }
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
                isDisabled={isClaiming || parseInt(amountTransfer === "" ? "0" : amountTransfer, 10) > parseInt(accountState.balance, 10) || amountTransfer === ""}
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

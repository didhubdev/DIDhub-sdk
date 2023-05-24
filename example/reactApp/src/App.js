// App.js

import { Button } from '@chakra-ui/button';
import { Box, Center, Container, Flex } from '@chakra-ui/layout';
import { Tag } from '@chakra-ui/tag';
import React, { useState } from 'react';

import { abbreviateAddress } from './utils';
import VestingInterface from './VestingInterface';

import { REQUIRED_CHAIN_ID } from './config';

import { useMetamask }  from "use-metamask";
import Web3             from "web3";

function App() {

  const [conFlag, setConFlag] = useState(false);
  const { connect, getAccounts, getChain, metaState } = useMetamask();
  const [chainId, setChainId] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);

  console.log("Starting up");

  const metamask = window.ethereum

  metamask.on('chainChanged', (id) => {
    setChainId(parseInt(id.slice(2), 16).toString());
  });
  
  return (
    <Container height="100vh">
      <Flex direction="column" height="100%" width="100%">
        { ! conFlag ?
        <Center p={5}>
          <Box mr={2}>Your Wallet:</Box>
            <Button
              colorScheme="blue"
              onClick={() => {
                if (!metaState.isConnected) {
                  (async () => {
                    try {
                      await connect(Web3);
                      
                      let accounts = await getAccounts();
                      setCurrentAccount(accounts[0]);
                      let chain = await getChain();
                      setChainId(chain.id);

                      setConFlag(true);

                    } catch (error) {
                      console.log(error);
                    }
                  })();
                }
              }
            }
            >
              Connect Metamask
            </Button>
        </Center> 
        : <Box><Box/><br/><Box/></Box> // some shit to take space
        }

        {!currentAccount ? (
          'Please connect your Metamask or change your address.'
        ) : chainId !== REQUIRED_CHAIN_ID ? (
          <Center>
            {`Incorrect network. Your current chain Id is ${chainId}, ${REQUIRED_CHAIN_ID} is needed.`}
          </Center>
        ) : 
        ( 
          <Flex flexGrow={1}>
            <VestingInterface/>
          </Flex>
        )}
      </Flex>
    </Container>
  );
}

// Wrap everything in <UseWalletProvider />
export default App;

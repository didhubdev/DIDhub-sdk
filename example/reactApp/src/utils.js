import { ethers } from 'ethers';
import { TOKEN_CONTRACT_ADDRESS } from "./config";

import {
  BigNumber,
  bigNumberify,
  getAddress,
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack
} from 'ethers/lib/utils';

export function formatTokenNum(x, symbol) {
  console.log(x);
  if (!x) return 'loading...';
  return (
    parseFloat(ethers.utils.formatEther(x.toString(), 'ether')).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ) + ` ${symbol}`
  );
}

export function abbreviateAddress(address) {
  return address.substr(0, 6) + '...' + address.substr(address.length - 4, 4);
}

export function createPermitMessageData(
  fromAddress, 
  nonce,
  value) {
  
  const message = {
    owner: fromAddress,
    data: value,
    nonce: nonce
  };

  const typedData = JSON.stringify({
    types: {
      EIP712Domain: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "version",
          type: "string",
        },
        {
          name: "chainId",
          type: "uint256",
        },
        {
          name: "verifyingContract",
          type: "address",
        }
      ],
      CreateProfile: [
        {
          name: "owner",
          type: "address",
        },
        {
          name: "data",
          type: "string",
        },
        {
          name: "nonce",
          type: "uint256",
        }
      ],
    },
    primaryType: "CreateProfile",
    domain: {
      name: "RADIAN",
      version: "1",
      chainId: 137,
      verifyingContract: TOKEN_CONTRACT_ADDRESS,
    },
    message: message,
  });

  return {
    typedData,
    message,
  };
};

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes('CreateProfile(address owner,string data,uint256 nonce)')
)

function getDomainSeparator(name, tokenAddress) {
  return keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes('1')),
        137,
        tokenAddress
      ]
    )
  )
}

export async function getApprovalDigest(
  tokenName,
  tokenAddress,
  approve,
  nonce,
  value
) {

  const DOMAIN_SEPARATOR = getDomainSeparator(tokenName, tokenAddress);
  const dataString = keccak256(toUtf8Bytes(value));
  
  console.log("Logging");
  console.log(toUtf8Bytes('CreateProfile(address owner,string data,uint256 nonce)'));
  console.log(keccak256(toUtf8Bytes('CreateProfile(address owner,string data,uint256 nonce)')));

  console.log("Default Encoder");
  console.log(defaultAbiCoder.encode(
    ['bytes32', 'address', 'bytes32', 'uint256'],
    [PERMIT_TYPEHASH, approve.owner, dataString, nonce]
  ));

  console.log("Keccak Encoder")
  console.log(keccak256(defaultAbiCoder.encode(
    ['bytes32', 'address', 'bytes32', 'uint256'],
    [PERMIT_TYPEHASH, approve.owner, dataString, nonce]
  )))

  console.log("Domain Separator");
  console.log(DOMAIN_SEPARATOR);

  console.log("solidity Hash Pack");
  console.log(keccak256(solidityPack(
    ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
    [
      '0x19',
      '0x01',
      DOMAIN_SEPARATOR,
      keccak256(
        defaultAbiCoder.encode(
          ['bytes32', 'address', 'bytes32', 'uint256'],
          [PERMIT_TYPEHASH, approve.owner, dataString, nonce]
        )
      )
    ]
  )));

  return keccak256(
    solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ['bytes32', 'address', 'bytes32', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, dataString, nonce]
          )
        )
      ]
    )
  )
}

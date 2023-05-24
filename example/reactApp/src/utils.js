import { ethers } from 'ethers';
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
import { getBatchTransferContract } from '../../contracts/didhub';
import { providers } from 'ethers'
import { IBatchTransfer, IBatchTransferInit } from './type';
import { ITokenStruct } from '../../contracts/didhub/batchTransfer/BatchTransfer';
import { utils } from 'modules/utils';

export const batchTransferInit: IBatchTransferInit = (
    provider: providers.JsonRpcSigner
): IBatchTransfer => {

    const domainInfo2Token = (
        domainInfos: string[]
    ): ITokenStruct[] => {
        const tokens: ITokenStruct[] = [];
        for (let i = 0; i < domainInfos.length; i++) {
            // splot the domainInfo by :, note: contractAddress may contains :
            let items = domainInfos[i].split(":");
            let contractAddress = items.slice(1, items.length - 1).join(":");
            let tokenId = items[items.length - 1];
            tokens.push({
                tokenAddress: contractAddress,
                tokenId: tokenId
            });
        }
        return tokens;
    }

    const getFixedFee = async () => {
        const batchTransferContract = await getBatchTransferContract(provider);
        const fixedFee = await batchTransferContract.fixedFee();
        return fixedFee;
    }

    const checkFee = async () => {
        const batchTransferContract = await getBatchTransferContract(provider);
        const fixedFee = await batchTransferContract.fixedFee();
        const balance = await provider.getBalance(await provider.getAddress());
        return balance.gt(fixedFee);
    }

    const getContractAddressesToApprove = (
        domainInfos: string[]
    ) => {
        const tokens = domainInfo2Token(domainInfos);
        const contractAddresses = [...new Set(tokens.map((token) => token.tokenAddress.toLowerCase()))];
        return contractAddresses;
    }

    const approveDomain = async (
        domainInfo: string
    ) => {
        const batchTransferContract = await getBatchTransferContract(provider);
        // select the contract address for approval
        const contractAddresses = getContractAddressesToApprove([domainInfo])[0];
        const approvalTx = await utils(provider).approveAllERC721or1155Tokens(contractAddresses, batchTransferContract.address);
        return approvalTx;
    }

    const approveAllDomains = async (
        domainInfos: string[]
    ) => {
        const batchTransferContract = await getBatchTransferContract(provider);
        // select the contract address for approval
        const contractAddresses = getContractAddressesToApprove(domainInfos);
        for (let i = 0 ; i < contractAddresses.length; i++) {
            const approvalTx = await utils(provider).approveAllERC721or1155Tokens(contractAddresses[i], batchTransferContract.address);
            if (approvalTx != null) {
                await approvalTx.wait();
            }
        }
    }

    const batchCheckApproval = async (
        domainInfos: string[]
    ) => {
        const tokens = domainInfo2Token(domainInfos);
        const batchTransferContract = await getBatchTransferContract(provider);
        const checkApproval = await batchTransferContract.hasApproval(
            tokens
        );
        return checkApproval;
    }

    const batchTransfer = async (
        domainInfos: string[],
        to: string
    ) => {
        const tokens = domainInfo2Token(domainInfos);
        const batchTransferContract = await getBatchTransferContract(provider);
        const fixedFee = await batchTransferContract.fixedFee();
        const batchTransferTx = await batchTransferContract.batchTransfer(
            tokens,
            to,
            {value: fixedFee}
        );

        return batchTransferTx;
    }

    return {
        getFixedFee: getFixedFee,
        checkFee: checkFee,
        batchCheckApproval: batchCheckApproval,
        getContractAddressesToApprove: getContractAddressesToApprove, 
        approveDomain: approveDomain,
        approveAllDomains: approveAllDomains,
        batchTransfer: batchTransfer
    }
}

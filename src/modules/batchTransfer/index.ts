import { getBatchTransferContract } from '../../contracts/didhub';
import { providers } from 'ethers'
import { IBatchTransfer, IBatchTransferInit } from './type';
import { utils } from '../../modules/utils';
import { getContractAddressSet, domainInfo2Token } from '../../utils';

export const batchTransferInit: IBatchTransferInit = (
    provider: providers.JsonRpcSigner
): IBatchTransfer => {

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

    const approveDomain = async (
        domainInfo: string
    ) => {
        const batchTransferContract = await getBatchTransferContract(provider);
        // select the contract address for approval
        const contractAddresses = getContractAddressSet([domainInfo])[0];
        const approvalTx = await utils(provider).approveAllERC721or1155Tokens(contractAddresses, batchTransferContract.address);
        return approvalTx;
    }

    const approveAllDomains = async (
        domainInfos: string[]
    ) => {
        const batchTransferContract = await getBatchTransferContract(provider);
        // select the contract address for approval
        const contractAddresses = getContractAddressSet(domainInfos);
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
        approveDomain: approveDomain,
        approveAllDomains: approveAllDomains,
        batchTransfer: batchTransfer
    }
}

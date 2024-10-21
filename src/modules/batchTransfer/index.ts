import { getBatchTransferContract } from '../../contracts/didhub';
import { BigNumber, providers } from 'ethers'
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

    // Estimate Gas ===========================================================
    const approveDomainEstimateGas = async (
        domainInfo: string
    ) => {
        const batchTransferContract = await getBatchTransferContract(provider);
        // select the contract address for approval
        const price = await provider.getGasPrice();
        const contractAddresses = getContractAddressSet([domainInfo])[0];
        try {
            const estimatedGas = await utils(provider).estimateGas.approveAllERC721or1155Tokens(contractAddresses, batchTransferContract.address);
            return estimatedGas.mul(price);

        } catch {
            return BigNumber.from(0);
        }
    }

    const approveAllDomainsEstimateGas = async (
        domainInfos: string[]
    ) => {
        const batchTransferContract = await getBatchTransferContract(provider);
        // select the contract address for approval
        const contractAddresses = getContractAddressSet(domainInfos);
        let totalGas = BigNumber.from(0);
        const price = await provider.getGasPrice();
        for (let i = 0 ; i < contractAddresses.length; i++) {
            try {
                const estimatedGas = await utils(provider).estimateGas.approveAllERC721or1155Tokens(contractAddresses[i], batchTransferContract.address);
                totalGas = totalGas.add(estimatedGas);
            } catch {
                return BigNumber.from(0);
            }
        }
        return totalGas.mul(price);
    }

    const batchTransferEstimateGas = async (
        domainInfos: string[],
        to: string
    ) => {
        const tokens = domainInfo2Token(domainInfos);
        const batchTransferContract = await getBatchTransferContract(provider);
        const fixedFee = await batchTransferContract.fixedFee();
        const price = await provider.getGasPrice();
        try {
            const estimatedGas = await batchTransferContract.estimateGas.batchTransfer(
                tokens,
                to,
                {value: fixedFee}
            );
            return estimatedGas.mul(price);
        } catch {
            return BigNumber.from(0);
        }
    }

    return {
        getFixedFee: getFixedFee,
        checkFee: checkFee,
        batchCheckApproval: batchCheckApproval, 
        approveDomain: approveDomain,
        approveAllDomains: approveAllDomains,
        batchTransfer: batchTransfer,
        estimateGas: {
            approveDomain: approveDomainEstimateGas,
            approveAllDomains: approveAllDomainsEstimateGas,
            batchTransfer: batchTransferEstimateGas
        }
    }
}

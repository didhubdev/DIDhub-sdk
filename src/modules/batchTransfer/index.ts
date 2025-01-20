import { getBatchTransferContract } from '../../contracts/didhub';
import { IBatchTransfer, IBatchTransferInit } from './type';
import { utils } from '../../modules/utils';
import { getContractAddressSet, domainInfo2Token } from '../../utils';
import { JsonRpcSigner } from 'ethers';

export const batchTransferInit: IBatchTransferInit = (
    signer: JsonRpcSigner
): IBatchTransfer => {

    const getFixedFee = async () => {
        const batchTransferContract = await getBatchTransferContract(signer);
        const fixedFee = await batchTransferContract.fixedFee();
        return fixedFee;
    }

    const checkFee = async () => {
        const batchTransferContract = await getBatchTransferContract(signer);
        const fixedFee = await batchTransferContract.fixedFee();
        const balance = await signer.provider.getBalance(await signer.getAddress());
        return balance > fixedFee;
    }

    const approveDomain = async (
        domainInfo: string
    ) => {
        const batchTransferContract = await getBatchTransferContract(signer);
        // select the contract address for approval
        const contractAddresses = getContractAddressSet([domainInfo])[0];
        const approvalTx = await utils(signer).approveAllERC721or1155Tokens(contractAddresses, await batchTransferContract.getAddress());
        return approvalTx;
    }

    const approveAllDomains = async (
        domainInfos: string[]
    ) => {
        const batchTransferContract = await getBatchTransferContract(signer);
        // select the contract address for approval
        const contractAddresses = getContractAddressSet(domainInfos);
        for (let i = 0 ; i < contractAddresses.length; i++) {
            const approvalTx = await utils(signer).approveAllERC721or1155Tokens(contractAddresses[i], await batchTransferContract.getAddress());
            if (approvalTx != null) {
                await approvalTx.wait();
            }
        }
    }

    const batchCheckApproval = async (
        domainInfos: string[]
    ) => {
        const tokens = domainInfo2Token(domainInfos);
        const batchTransferContract = await getBatchTransferContract(signer);
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
        const batchTransferContract = await getBatchTransferContract(signer);
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
        const batchTransferContract = await getBatchTransferContract(signer);
        // select the contract address for approval
        const feeData = await signer.provider.getFeeData();
        const contractAddresses = getContractAddressSet([domainInfo])[0];
        try {
            const estimatedGas = await utils(signer).estimateGas.approveAllERC721or1155Tokens(contractAddresses, await batchTransferContract.getAddress());
            return estimatedGas *  feeData.gasPrice!;

        } catch {
            return BigInt(0);
        }
    }

    const approveAllDomainsEstimateGas = async (
        domainInfos: string[]
    ) => {
        const batchTransferContract = await getBatchTransferContract(signer);
        // select the contract address for approval
        const contractAddresses = getContractAddressSet(domainInfos);
        let totalGas = BigInt(0);
        const feeData = await signer.provider.getFeeData();
        for (let i = 0 ; i < contractAddresses.length; i++) {
            try {
                const estimatedGas = await utils(signer).estimateGas.approveAllERC721or1155Tokens(contractAddresses[i], await batchTransferContract.getAddress());
                totalGas = totalGas + estimatedGas;
            } catch {
                return BigInt(0);
            }
        }
        return totalGas *  feeData.gasPrice!;
    }

    const batchTransferEstimateGas = async (
        domainInfos: string[],
        to: string
    ) => {
        const tokens = domainInfo2Token(domainInfos);
        const batchTransferContract = await getBatchTransferContract(signer);
        const fixedFee = await batchTransferContract.fixedFee();
        const feeData = await signer.provider.getFeeData();
        try {
            const estimatedGas = await batchTransferContract.batchTransfer.estimateGas(
                tokens,
                to,
                {value: fixedFee}
            );
            return estimatedGas * feeData.gasPrice!;
        } catch {
            return BigInt(0);
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

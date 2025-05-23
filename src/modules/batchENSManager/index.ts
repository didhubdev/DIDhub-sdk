import { getBatchENSManagerContract } from '../../contracts/didhub';
import { BrowserProvider, JsonRpcSigner, Signer, ethers, keccak256, namehash, toUtf8Bytes } from 'ethers'
import { IBatchENSManager, IBatchENSManagerInit } from './type';
import { getENSTokenWrapParams } from '../../utils';
import { utils } from '../../modules/utils';

export const batchENSManagerInit: IBatchENSManagerInit = (
    signer: JsonRpcSigner
): IBatchENSManager => {

    const nameKey2Names = (nameKeys: string[]) => {
        const names = nameKeys.map(nameKey => {
            let nameSlices =  nameKey.split(":")[1].split(".");
            return nameSlices[nameSlices.length - 1];
        });
        return names;
    }

    const name2TokenId = (names: string[]) => {
        // convert name into tokenIds
        const tokenIds = names.map(name => {
            return keccak256(
                toUtf8Bytes(name)
            );
        });
        return tokenIds;
    }

    const getFixedFee = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const fixedFee = await batchENSManagerContract.fixedFee();
        return fixedFee;
    }
    
    const checkFee = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const fixedFee = await batchENSManagerContract.fixedFee();
        const balance = await signer.provider.getBalance(await signer.getAddress());
        return balance > fixedFee;
    }

    const batchCheckWrapStatus = async (
        nameKeys: string[]
    ) => {
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const wrapStatus = await batchENSManagerContract.isWrapped(
            tokenIds
        );
        return wrapStatus;
    }

    const batchCheckUnwrappedETH2LDOwnerStatus = async (
        nameKeys: string[]
    ) => {
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const ownerStatus = await Promise.all(tokenIds.map(async (tokenId) => {
            return await utils(signer).isERC721Owner(
                "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85", // ENS Base Implementation
                tokenId
            );
        }));
        return ownerStatus;
    }

    const batchCheckWrappedETH2LDOwnerStatus = async (
        nameKeys: string[]
    ) => {
        const names = nameKey2Names(nameKeys);
        // convert 2LD name into name wrapper node
        const nodes = names.map(name => {
            return namehash(name + ".eth");
        });

        const ownerStatus = await Promise.all(nodes.map(async (node) => {
            return await utils(signer).isERC721Owner(
                "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401", // ENS Name Wrapper
                node
            );
        }));
        return ownerStatus;
    }

    const batchCheckUnwrappedETH2LDApproval = async (
        nameKeys: string[]
    ) => {
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const checkApproval = await batchENSManagerContract.hasApproval(
            tokenIds
        );
        return checkApproval;
    }

    const batchUnwrap = async (
        nameKeys: string[],
        to?: string
    ) => {
        if (!to) {
            to = await signer.getAddress();
        }
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const fixedFee = await batchENSManagerContract.fixedFee();
        const batchUnwrapTx = await batchENSManagerContract.batchUnwrap(
            tokenIds,
            to,
            {value: fixedFee}
        );

        return batchUnwrapTx;
    }

    const batchCheckWrappedETH2LDApproval = async (
        nameKeys: string[]
    ) => {
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const checkApproval = await batchENSManagerContract.hasApprovalNameWrapper(
            tokenIds
        );
        return checkApproval;
    }

    const batchWrap = async (
        nameKeys: string[],
        to?: string
    ) => {
        if (!to) {
            to = await signer.getAddress();
        }
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const owner = await signer.getAddress();
        // get data
        const datas = getENSTokenWrapParams(names, owner);

        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const fixedFee = await batchENSManagerContract.fixedFee();
        const batchWrapTx = await batchENSManagerContract.batchWrap(
            tokenIds,
            datas,
            to,
            {value: fixedFee}
        );

        return batchWrapTx;
    }

    const approveUnwrappedETH2LDDomains = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        // select the contract address for approval
        const contractAddresses = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85"; // unlikely to change
        const approvalTx = await utils(signer).approveAllERC721or1155Tokens(contractAddresses, await batchENSManagerContract.getAddress());
        return approvalTx;
    }

    const approveWrappedETH2LDDomains = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        // select the contract address for approval
        const contractAddresses = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401"; // unlikely to change
        const approvalTx = await utils(signer).approveAllERC721or1155Tokens(contractAddresses, await batchENSManagerContract.getAddress());
        return approvalTx;
    }
        
    // Estimate gas ===========================================================
    const batchUnwrapEstimateGas = async (
        nameKeys: string[],
        to?: string
    ) => {
        if (!to) {
            to = await signer.getAddress();
        }
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const fixedFee = await batchENSManagerContract.fixedFee();
        const feeData = await signer.provider.getFeeData();
        try {
            const estimatedGas = await batchENSManagerContract.batchUnwrap.estimateGas(
                tokenIds,
                to,
                {value: fixedFee}
            );
            return estimatedGas * feeData.gasPrice!;
        } catch {
            return BigInt(0);
        }
    }

    const batchWrapEstimateGas = async (
        nameKeys: string[],
        to?: string
    ) => {
        if (!to) {
            to = await signer.getAddress();
        }
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const owner = await signer.getAddress();
        // get data
        const datas = getENSTokenWrapParams(names, owner);

        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        const fixedFee = await batchENSManagerContract.fixedFee();
        const feeData = await signer.provider.getFeeData();
        try {
            const estimatedGas = await batchENSManagerContract.batchWrap.estimateGas(
                tokenIds,
                datas,
                to,
                {value: fixedFee}
            );
            return estimatedGas * feeData.gasPrice!;
        } catch {
            return BigInt(0);
        }
    }

    const approveUnwrappedETH2LDDomainsEstimateGas = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        // select the contract address for approval
        const contractAddresses = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85"; // unlikely to change
        const feeData = await signer.provider.getFeeData();
        try {
            const estimatedGas = await utils(signer).estimateGas.approveAllERC721or1155Tokens(contractAddresses, await batchENSManagerContract.getAddress());
            return estimatedGas * feeData.gasPrice!;    
        } catch {
            return BigInt(0);
        }
    }

    const approveWrappedETH2LDDomainsEstimateGas = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(signer);
        // select the contract address for approval
        const contractAddresses = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401"; // unlikely to change
        const feeData = await signer.provider.getFeeData();
        try {
            const estimatedGas = await utils(signer).estimateGas.approveAllERC721or1155Tokens(contractAddresses, await batchENSManagerContract.getAddress());
            return estimatedGas * feeData.gasPrice!;
        } catch {
            return BigInt(0);
        }
    }

    return {
        getFixedFee: getFixedFee,
        checkFee: checkFee,
        batchCheckUnwrappedETH2LDOwnerStatus: batchCheckUnwrappedETH2LDOwnerStatus,
        batchCheckWrappedETH2LDOwnerStatus: batchCheckWrappedETH2LDOwnerStatus,
        batchCheckWrapStatus: batchCheckWrapStatus,
        batchCheckUnwrappedETH2LDApproval: batchCheckUnwrappedETH2LDApproval,
        batchCheckWrappedETH2LDApproval: batchCheckWrappedETH2LDApproval,
        batchUnwrap: batchUnwrap,
        batchWrap: batchWrap,
        approveUnwrappedETH2LDDomains: approveUnwrappedETH2LDDomains,
        approveWrappedETH2LDDomains: approveWrappedETH2LDDomains,
        estimateGas: {
            batchUnwrap: batchUnwrapEstimateGas,
            batchWrap: batchWrapEstimateGas,
            approveUnwrappedETH2LDDomains: approveUnwrappedETH2LDDomainsEstimateGas,
            approveWrappedETH2LDDomains: approveWrappedETH2LDDomainsEstimateGas
        }
    }

}

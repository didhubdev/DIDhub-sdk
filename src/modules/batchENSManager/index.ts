import { getBatchENSManagerContract } from '../../contracts/didhub';
import { providers, ethers } from 'ethers'
import { IBatchENSManager, IBatchENSManagerInit } from './type';
import { getENSTokenWrapParams } from '../../utils';
import { utils } from '../../modules/utils';
import { getContractAddressSet } from '../../utils';

export const batchENSManagerInit: IBatchENSManagerInit = (
    provider: providers.JsonRpcSigner
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
            return ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes(name)
            );
        });
        return tokenIds;
    }

    const getFixedFee = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        const fixedFee = await batchENSManagerContract.fixedFee();
        return fixedFee;
    }
    
    const checkFee = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        const fixedFee = await batchENSManagerContract.fixedFee();
        const balance = await provider.getBalance(await provider.getAddress());
        return balance.gt(fixedFee);
    }

    const batchCheckWrapStatus = async (
        nameKeys: string[]
    ) => {
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        const wrapStatus = await batchENSManagerContract.isWrapped(
            tokenIds
        );
        return wrapStatus;
    }

    const batchCheckOwnerStatus = async (
        nameKeys: string[]
    ) => {
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const ownerStatus = await Promise.all(tokenIds.map(async (tokenId) => {
            return await utils(provider).isERC721Owner(
                "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85", // ENS Base Implementation
                tokenId
            );
        }));
        return ownerStatus;
    }

    const batchCheckNameWrapperOwnerStatus = async (
        nameKeys: string[]
    ) => {
        const names = nameKey2Names(nameKeys);
        // convert 2LD name into name wrapper node
        const nodes = names.map(name => {
            return ethers.utils.namehash(name + ".eth");
        });

        const ownerStatus = await Promise.all(nodes.map(async (node) => {
            return await utils(provider).isERC721Owner(
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
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
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
            to = await provider.getAddress();
        }
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
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
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
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
            to = await provider.getAddress();
        }
        const names = nameKey2Names(nameKeys);
        const tokenIds = name2TokenId(names);
        const owner = await provider.getAddress();
        // get data
        const datas = getENSTokenWrapParams(names, owner);

        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        const fixedFee = await batchENSManagerContract.fixedFee();
        const batchWrapTx = await batchENSManagerContract.batchWrap(
            tokenIds,
            datas,
            to,
            {value: fixedFee}
        );

        return batchWrapTx;
    }

    const approveBaseImplementationDomains = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        // select the contract address for approval
        const contractAddresses = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85"; // unlikely to change
        const approvalTx = await utils(provider).approveAllERC721or1155Tokens(contractAddresses, batchENSManagerContract.address);
        return approvalTx;
    }

    const approveNameWrapperDomains = async () => {
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        // select the contract address for approval
        const contractAddresses = "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401"; // unlikely to change
        const approvalTx = await utils(provider).approveAllERC721or1155Tokens(contractAddresses, batchENSManagerContract.address);
        return approvalTx;
    }
        
    return {
        getFixedFee: getFixedFee,
        checkFee: checkFee,
        batchCheckOwnerStatus: batchCheckOwnerStatus,
        batchCheckNameWrapperOwnerStatus: batchCheckNameWrapperOwnerStatus,
        batchCheckWrapStatus: batchCheckWrapStatus,
        batchCheckUnwrappedETH2LDApproval: batchCheckUnwrappedETH2LDApproval,
        batchCheckWrappedETH2LDApproval: batchCheckWrappedETH2LDApproval,
        batchUnwrap: batchUnwrap,
        batchWrap: batchWrap,
        approveBaseImplementationDomains: approveBaseImplementationDomains,
        approveNameWrapperDomains: approveNameWrapperDomains
    }

}

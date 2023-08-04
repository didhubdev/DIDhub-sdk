import { getBatchENSManagerContract } from '../../contracts/didhub';
import { providers, ethers } from 'ethers'
import { IBatchENSManager, IBatchENSManagerInit } from './type';
import { getENSTokenWrapParams } from '../../utils';
import { utils } from '../../modules/utils';

export const batchENSManagerInit: IBatchENSManagerInit = (
    provider: providers.JsonRpcSigner
): IBatchENSManager => {

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
        names: string[]
    ) => {
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        const wrapStatus = await batchENSManagerContract.isWrapped(
            tokenIds
        );
        return wrapStatus;
    }

    const batchCheckOwnerStatus = async (
        names: string[]
    ) => {
        const tokenIds = name2TokenId(names);
        const ownerStatus = await Promise.all(tokenIds.map(async (tokenId) => {
            return await utils(provider).isERC721Owner(
                "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85", // ENS Base Implementation
                tokenId
            );
        }));
        return ownerStatus;
    }

    const batchCheckUnwrappedETH2LDApproval = async (
        names: string[]
    ) => {
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        const checkApproval = await batchENSManagerContract.hasApproval(
            tokenIds
        );
        return checkApproval;
    }

    const batchUnwrap = async (
        names: string[],
        to: string
    ) => {
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
        names: string[]
    ) => {
        const tokenIds = name2TokenId(names);
        const batchENSManagerContract = await getBatchENSManagerContract(provider);
        const checkApproval = await batchENSManagerContract.hasApprovalNameWrapper(
            tokenIds
        );
        return checkApproval;
    }

    const batchWrap = async (
        names: string[],
        to: string
    ) => {
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

    return {
        getFixedFee: getFixedFee,
        checkFee: checkFee,
        batchCheckWrapStatus: batchCheckWrapStatus,
        batchCheckOwnerStatus: batchCheckOwnerStatus,
        batchCheckUnwrappedETH2LDApproval: batchCheckUnwrappedETH2LDApproval,
        batchUnwrap: batchUnwrap,
        batchCheckWrappedETH2LDApproval: batchCheckWrappedETH2LDApproval,
        batchWrap: batchWrap
    }

}

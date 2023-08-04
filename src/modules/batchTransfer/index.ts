import { getBatchTransferContract } from '../../contracts/didhub';
import { providers } from 'ethers'
import { IBatchTransfer, IBatchTransferInit } from './type';
import { ITokenStruct } from 'contracts/didhub/batchTransfer/BatchTransfer';

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

    const batchCheckApproval = async (
        tokens: ITokenStruct[]
    ) => {
        const batchTransferContract = await getBatchTransferContract(provider);
        const checkApproval = await batchTransferContract.hasApproval(
            tokens
        );
        return checkApproval;
    }

    const batchTransfer = async (
        tokens: ITokenStruct[],
        to: string
    ) => {
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
        batchTransfer: batchTransfer
    }
}

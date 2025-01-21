import { AddressLike, BigNumberish, BytesLike, ethers } from 'ethers';
import { ZERO_ADDRESS } from '../config';
import { Data } from '../contracts/didhub/batchRegister/BatchRegister';
import { IDomainInfo, INFTToken } from './type';
import { namehash, keccak256, toUtf8Bytes, AbiCoder } from 'ethers';

interface SelectField<T> {
    [key: string]: T;
}

interface ResultStruct<T> extends SelectField<T> {
    project: AddressLike;
    [key: string]: any;
}

export const wrapDomain = (domains: IDomainInfo[]): Record<string, Data.DomainInfoStruct[]>  => {
    let domainInfo: Record<string, Data.DomainInfoStruct[]> = {};

    domains.forEach((domain) => {
        let collectionInfo = domain.collectionInfo;
        let contractAddress = collectionInfo.split(":").slice(1).join(":").toLowerCase();
        let fullName = domain.nameKey.split(":")[1];
        let nameStr = fullName.split(".");
        let name = nameStr[nameStr.length - 1];
        
        if (domainInfo[contractAddress]) {
            domainInfo[contractAddress].push(
                {
                    name: name,
                    duration: domain.duration ? domain.duration : 0
                }
            );
        } else {
            domainInfo[contractAddress] = [
                {
                    name: name,
                    duration: domain.duration ? domain.duration : 0
                }
            ]
        }
    });
    return domainInfo;
}

export const unwrapResult = <T>(domains: IDomainInfo[], result: ResultStruct<T>[], field: string ): T[] => {
    let resultClone = result.map(r=>({...r}));
    // unwrap results to list
    let unwrappedList: T[] = [];
    domains.forEach(d=>{
        let project = d.collectionInfo.split(":").slice(1).join(":").toLowerCase();
        resultClone.forEach(r=>{
            if (project == (r.project as string).toLowerCase()) {
                unwrappedList.push(r[field][0]);
                r[field] = r[field].length > 0 ? r[field].slice(1) : [];
            }
        });
    })
    return unwrappedList;
}

const abiCoder = new AbiCoder();
const k256 = (label: string) => keccak256(toUtf8Bytes(label));
const namehash2LD = (label: string) => keccak256(abiCoder.encode(["bytes32", "bytes32"], [namehash("eth"), k256(label)]));

export const getENSNameResolutionParams = (
    domains: Data.DomainInfoStruct[],
    owner: string
): BytesLike => {
    // create nodes for the domain
    const nodes = domains.map((d) => {
        // updated namehash function , prevent errors from hashing emojis
        return namehash2LD(d.name);
    });

    // create param data from nodes and owner
    const paramData = nodes.map((n) => {
        const byteString = `0x8b95dd71${n.slice(2)}000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000014${owner.slice(2).toLowerCase()}000000000000000000000000`;
        return [byteString];
    });

    return abiCoder.encode(['bytes[][]'], [paramData]);
}

export const getENSTokenWrapParams = (
    names: string[], // domain names
    owner: string    // address
): BytesLike[] => {

    // create param data from nodes and owner
    let resolver = "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63";
    let fuse = 0;
    const dataArray = names.map((n) => {
        console.log(n);
        const result = abiCoder.encode(
            ["string", "address", "uint16", "address"],
            [n, owner.toLowerCase(), fuse, resolver.toLowerCase()]
        );
        return result;
    });

    return dataArray;
}

export const getRegistrationInfo = (
    domains: IDomainInfo[],
    owner: string,
    secret: string,
    paymentToken: string = ZERO_ADDRESS,
    paymentMax: BigNumberish = 0
): Data.RegistrationInfoStruct[] => {

    let wrappedDomains = wrapDomain(domains);
    let registrationInfoStructs: Data.RegistrationInfoStruct[] = [];
    Object.keys(wrappedDomains).forEach((contractAddress) => {
        let params: BytesLike = "0x";
        
        // compute params if it is ENS project
        if (
            [
                "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85".toLowerCase(),
                "0x114D4603199df73e7D157787f8778E21fCd13066".toLowerCase(), // name wrapper goerli
                "0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401".toLowerCase() // name wrapper mainnet
            ].includes(contractAddress.toLowerCase())
        ) {
            params = getENSNameResolutionParams(wrappedDomains[contractAddress], owner);
        }

        registrationInfoStructs.push({
            project: contractAddress,
            domains: wrappedDomains[contractAddress],
            paymentMax: paymentMax,
            paymentToken: paymentToken,
            owner: owner,
            secret: secret,
            params: params
        });
    });

    return registrationInfoStructs;
}

export const getRenewInfo = (
    domains: IDomainInfo[],
    paymentToken: string = ZERO_ADDRESS,
    paymentMax: BigNumberish = 0
): Data.RenewInfoStruct[] => {

    let wrappedDomains = wrapDomain(domains);
    let renewInfoStructs: Data.RenewInfoStruct[] = [];
    Object.keys(wrappedDomains).forEach((contractAddress) => {
        let params: BytesLike = "0x";
        renewInfoStructs.push({
            project: contractAddress,
            domains: wrappedDomains[contractAddress],
            paymentMax: paymentMax,
            paymentToken: paymentToken,
            params: params
        });
    });

    return renewInfoStructs;
}

export const getPriceRequest = (
    domains: IDomainInfo[]
): Data.PriceRequestStruct[] => {

    let wrappedDomains = wrapDomain(domains);
    let priceRequestStructs: Data.PriceRequestStruct[] = [];
    Object.keys(wrappedDomains).forEach((contractAddress) => {
        priceRequestStructs.push({
            project: contractAddress,
            domains: wrappedDomains[contractAddress]
        });
    });
    return priceRequestStructs;
}


export const getContractAddressSet = (
    domainInfos: string[]
) => {
    const tokens = domainInfo2Token(domainInfos);
    const contractAddresses = [...new Set(tokens.map((token) => token.tokenAddress.toLowerCase()))];
    return contractAddresses;
}

export const domainInfo2Token = (
    domainInfos: string[]
): INFTToken[] => {
    const tokens: INFTToken[] = [];
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

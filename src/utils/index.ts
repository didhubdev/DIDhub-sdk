import { BigNumberish, BytesLike, ethers } from 'ethers';
import { ZERO_ADDRESS } from '../config';
import { RegistrationInfoStruct, PriceRequestStruct, DomainInfoStruct } from '../contracts/didhub/BSC/BatchRegister';
import { IDomainInfo } from './type';

interface SelectField<T> {
    [key: string]: T;
}

interface ResultStruct<T> extends SelectField<T> {
    project: string;
    [key: string]: any;
}

export const wrapDomain = (domains: IDomainInfo[]): Record<string, DomainInfoStruct[]>  => {
    let domainInfo: Record<string, DomainInfoStruct[]> = {};

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
            if (project == r.project.toLowerCase()) {
                unwrappedList.push(r[field][0]);
                r[field] = r[field].length > 0 ? r[field].slice(1) : [];
            }
        });
    })
    return unwrappedList;
}

export const getENSNameResolutionParams = (
    domains: DomainInfoStruct[],
    owner: string
): BytesLike => {
    // create nodes for the domain
    const nodes = domains.map((d) => {
        return ethers.utils.namehash(d.name + ".eth");
    });

    // create param data from nodes and owner
    const paramData = nodes.map((n) => {
        const byteString = `0x8b95dd71${n.slice(2)}000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000014${owner.slice(2).toLowerCase()}000000000000000000000000`;
        return [byteString];
    });

    return ethers.utils.defaultAbiCoder.encode(['bytes[][]'], [paramData]);
}

export const getRegistrationInfo = (
    domains: IDomainInfo[],
    owner: string,
    secret: string,
    paymentToken: string = ZERO_ADDRESS,
    paymentMax: BigNumberish = 0
): RegistrationInfoStruct[] => {

    let wrappedDomains = wrapDomain(domains);
    let registrationInfoStructs: RegistrationInfoStruct[] = [];
    Object.keys(wrappedDomains).forEach((contractAddress) => {
        let params: BytesLike = [];
        
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

export const getPriceRequest = (
    domains: IDomainInfo[]
): PriceRequestStruct[] => {

    let wrappedDomains = wrapDomain(domains);
    let priceRequestStructs: PriceRequestStruct[] = [];
    Object.keys(wrappedDomains).forEach((contractAddress) => {
        priceRequestStructs.push({
            project: contractAddress,
            domains: wrappedDomains[contractAddress]
        });
    });
    return priceRequestStructs;
}



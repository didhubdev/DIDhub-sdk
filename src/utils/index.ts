import { BigNumberish } from 'ethers';
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
    // unwrap results to list
    let unwrappedList: T[] = [];
    domains.forEach(d=>{
        let project = d.collectionInfo.split(":").slice(1).join(":").toLowerCase();
        result.forEach(r=>{
            if (project = r.project.toLowerCase()) {
                let fieldResults = r[field];
                unwrappedList.push(fieldResults.shift());
                r.field = fieldResults;
            }
        });
    })
    return unwrappedList;
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
        registrationInfoStructs.push({
            project: contractAddress,
            domains: wrappedDomains[contractAddress],
            paymentMax: paymentMax,
            paymentToken: paymentToken,
            owner: owner,
            secret: secret,
            params: []
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



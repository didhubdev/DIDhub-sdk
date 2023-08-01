import { OrderWithCounter } from '@opensea/seaport-js/lib/types';
import fetch from 'cross-fetch';

let cache: Record<string, OrderWithCounter> = {};

export const getOpenseaListingData = async (
    orderId: string,
    signer: string,
    useCache: boolean = true
) => {

    // read from cache
    if (useCache && cache[orderId + signer]) {
      return cache[orderId + signer];
    }

    const response = await fetch(
        `https://api.didhub.com/nftmarketplace/v1/opensea/listing?orderId=${orderId}&signer=${signer}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )

    if (response.status === 429) {
      throw new Error('Too Many Requests');
    }

    const data = await response.json();

    // save to cache
    if (data.code !== 1) {
      throw new Error(data.message);
    } else {
      cache[orderId + signer] = data;
    }

    return data;
};

export const getOpenseaOfferData = async (
    orderId: string,
    signer: string,
    useCache: boolean = true
) => {

    // read from cache
    if (useCache && cache[orderId + signer]) {
      return cache[orderId + signer];
    }

    const response = await fetch(
        `https://api.didhub.com/nftmarketplace/v1/opensea/offer?orderId=${orderId}&signer=${signer}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )

    if (response.status === 429) {
      throw new Error('Too Many Requests');
    }

    const data = await response.json();

    // save to cache
    if (data.code !== 1) {
      throw new Error(data.message);
    } else {
      cache[orderId + signer] = data;
    }

    return data;
}

export const postOpenseaOfferData = async (
    orders: OrderWithCounter[],
    chain: string
) => {

    let orderData = orders.map((o) => {
      return {
        parameters: o.parameters,
        signature: o.signature,
        protocolAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
        chain: chain
      }
    });

    const response = await fetch(
      "https://api.didhub.com/nftmarketplace/v1/opensea/offer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({orders: orderData})
      },
    )

    if (response.status === 429) {
      throw new Error('Too Many Requests');
    }

    const data = await response.json();
    return data;
}

export const postOpenseaListingData = async (
    order: OrderWithCounter[],
    chain: string
) => {

    let orderData = order.map((o) => {
      return {
        parameters: o.parameters,
        signature: o.signature,
        protocolAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
        chain: chain
      }
    });

    const response = await fetch(
        "https://api.didhub.com/nftmarketplace/v1/opensea/listing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({orders: orderData})
        },
      )

    if (response.status === 429) {
      throw new Error('Too Many Requests');
    }

    const data = await response.json();
    return data;
}

export const getOrders = async (
    orderIds: string[]
) => {

    const response = await fetch(
        "https://api.didhub.com/nftmarketplace/v1/opensea/orders",
        {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              orderIds: orderIds
            })
          },
    );
    
    if (response.status === 429) {
      throw new Error('Too Many Requests');
    }
    
    const data = await response.json();
    return data.data;
}
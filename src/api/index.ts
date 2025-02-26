import { OrderWithCounter } from '@opensea/seaport-js/lib/types';
import fetch from 'cross-fetch';

let cache: Record<string, OrderWithCounter> = {};

const getAPIDomain = (environment: "production" | "dev") => {
    if (environment === "production") {
        return "https://api.didhub.com";
    } else {
        return "https://stage-api.didhub.com";
    }
}

export const getOpenseaListingData = async (
    orderId: string,
    signer: string,
    useCache: boolean = true,
    environment: "production" | "dev" = "production"
) => {
    
    // read from cache
    if (useCache && cache[orderId + signer]) {
      return cache[orderId + signer];
    }

    const API_DOMAIN = getAPIDomain(environment);

    const response = await fetch(
        `${API_DOMAIN}/nftmarketplace/v1/opensea/listing?orderId=${orderId}&signer=${signer}`,
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
    useCache: boolean = true,
    environment: "production" | "dev" = "production"
) => {

    // read from cache
    if (useCache && cache[orderId + signer]) {
      return cache[orderId + signer];
    }

    const API_DOMAIN = getAPIDomain(environment);
    const response = await fetch(
        `${API_DOMAIN}/nftmarketplace/v1/opensea/offer?orderId=${orderId}&signer=${signer}`,
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
    chain: string,
    environment: "production" | "dev" = "production"
) => {

    let orderData = orders.map((o) => {
      return {
        parameters: o.parameters,
        signature: o.signature,
        protocolAddress: "0x0000000000000068f116a894984e2db1123eb395",
        chain: chain
      }
    });

    const API_DOMAIN = getAPIDomain(environment);
    const response = await fetch(
      `${API_DOMAIN}/nftmarketplace/v1/opensea/offer`,
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

    // save to cache
    if (data.code !== 1) {
      throw new Error(data.message);
    }

    return data;
}

export const postOpenseaListingData = async (
    order: OrderWithCounter[],
    chain: string,
    environment: "production" | "dev" = "production"
) => {

    let orderData = order.map((o) => {
      return {
        parameters: o.parameters,
        signature: o.signature,
        protocolAddress: "0x0000000000000068f116a894984e2db1123eb395",
        chain: chain
      }
    });

    const API_DOMAIN = getAPIDomain(environment);
    const response = await fetch(
        `${API_DOMAIN}/nftmarketplace/v1/opensea/listing`,
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

    // save to cache
    if (data.code !== 1) {
      throw new Error(data.message);
    }

    return data;
}

export const getOrders = async (
    orderIds: string[],
    environment: "production" | "dev" = "production"
) => {

    const API_DOMAIN = getAPIDomain(environment);
    const response = await fetch(
        `${API_DOMAIN}/nftmarketplace/v1/opensea/orders`,
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
    
    // save to cache
    if (data.code !== 1) {
      throw new Error(data.message);
    }
    
    return data.data;
}

export const getOrdersValidity = async (
  orderIds: string[],
  environment: "production" | "dev" = "production"
) => {

  const API_DOMAIN = getAPIDomain(environment);
  const response = await fetch(
      `${API_DOMAIN}/nftmarketplace/v1/opensea/orders/validity`,
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
  
  // save to cache
  if (data.code !== 1) {
    throw new Error(data.message);
  }
  
  return data.data;
}
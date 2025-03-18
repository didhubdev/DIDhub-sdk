import { OrderWithCounter } from '@opensea/seaport-js/lib/types';
import { OpenseaException, OrderDataException, RateLimitException } from '../error';
import fetch from 'cross-fetch';

let cache: Record<string, OrderWithCounter> = {};

const getAPIDomain = (environment: "production" | "dev") => {
    if (environment === "production") {
        return "https://api.didhub.com";
    } else {
        return "https://stage-api.didhub.com";
    }
}

export const getOpenseaBasisPoints = async (
  environment: "production" | "dev" = "production"
): Promise<number> => {

  const API_DOMAIN = getAPIDomain(environment);

  const response = await fetch(
      `${API_DOMAIN}/nftmarketplace/v1/opensea/basisPoints`,
      {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          }
      }
  )

  if (response.status === 429) {
    throw new RateLimitException('Too Many Requests', '429');
  }
  
  if (response.status !== 200) {
    return 250;
  }

  const data = await response.json();
  return parseInt(data.data.basisPoints);
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
      throw new RateLimitException('Too Many Requests', '429');
    }

    if (response.status !== 200 ) {
      throw new OpenseaException("Opensea API returns an error", "400")
    }

    const data = await response.json();

    // save to cache
    if (data.code !== 1) {
      throw new OrderDataException(data.message, "400");
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
      throw new RateLimitException('Too Many Requests', '429');
    }

    if (response.status !== 200 ) {
      throw new OpenseaException("Opensea API returns an error", "400")
    }

    const data = await response.json();

    // save to cache
    if (data.code !== 1) {
      throw new OrderDataException(data.message, "400");
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
      throw new RateLimitException('Too Many Requests', '429');
    }

    // save to cache
    if (response.status === 401) {
      const data = await response.json();
      let errorString = "";
      data.message.forEach((o: any) => {
        errorString += o.key + ": " + o.error + "\n";
      });
      throw new OrderDataException(errorString, "401");
    }
        
    if (response.status !== 200 ) {
      throw new OpenseaException("Opensea API returns an error", "400")
    }

    const data = await response.json();

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
      throw new RateLimitException('Too Many Requests', '429');
    }

    if (response.status !== 200 ) {
      throw new OpenseaException("Opensea API returns an error", "400")
    }

    const data = await response.json();

    // save to cache
    if (data.code !== 1) {
      throw new OrderDataException(data.message, "400");
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
      throw new RateLimitException('Too Many Requests', '429');
    }

    if (response.status !== 200 ) {
      throw new OpenseaException("Opensea API returns an error", "400")
    }

    const data = await response.json();
    
    // save to cache
    if (data.code !== 1) {
      throw new OrderDataException(data.message, "400");
    }
    
    return data.data;
}

export const getInvalidListings = async (
  domainInfo: string,
  paymentToken: string,
  paymentAmount: string,
  environment: "production" | "dev" = "production"
): Promise<string[]> => {

  if (!paymentToken.includes(":")) {
    throw new Error('Invalid payment token');
  }
  
  const API_DOMAIN = getAPIDomain(environment);
  const response = await fetch(
      `${API_DOMAIN}/nftmarketplace/v1/opensea/listing/cancel?domainInfo=${domainInfo}&paymentToken=${paymentToken}&paymentAmount=${paymentAmount}`,
      {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        },
  );
  
  if (response.status === 429) {
    throw new RateLimitException('Too Many Requests', '429');
  }

  if (response.status !== 200 ) {
    throw new OpenseaException("Opensea API returns an error", "400")
  }

  const data = await response.json();
  
  // save to cache
  if (data.code !== 1) {
    throw new OrderDataException(data.message, "400");
  }
  
  return data.data;
}

export const getInvalidOffers = async (
  domainInfo: string,
  paymentToken: string,
  paymentAmount: string,
  environment: "production" | "dev" = "production"
): Promise<string[]> => {

  if (!paymentToken.includes(":")) {
    throw new Error('Invalid payment token');
  }
  
  const API_DOMAIN = getAPIDomain(environment);
  const response = await fetch(
      `${API_DOMAIN}/nftmarketplace/v1/opensea/offer/cancel?domainInfo=${domainInfo}&paymentToken=${paymentToken}&paymentAmount=${paymentAmount}`,
      {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        },
  );
  
  if (response.status === 429) {
    throw new RateLimitException('Too Many Requests', '429');
  }

  if (response.status !== 200 ) {
    throw new OpenseaException("Opensea API returns an error", "400")
  }

  const data = await response.json();
  
  // save to cache
  if (data.code !== 1) {
    throw new OrderDataException(data.message, "400");
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
    throw new RateLimitException('Too Many Requests', '429');
  }

  if (response.status !== 200 ) {
    throw new OpenseaException("Opensea API returns an error", "400")
  }
  
  const data = await response.json();
  
  // save to cache
  if (data.code !== 1) {
    throw new OrderDataException(data.message, "400");
  }
  
  return data.data;
}
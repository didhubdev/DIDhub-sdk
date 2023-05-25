import fetch from 'cross-fetch';

export const getOpenseaListingData = async (
    orderId: string,
    signer: string
) => {

    const response = await fetch(
        `https://stage.api.didhub.com/nftmarketplace/v1/opensea/listing?orderId=${orderId}&signer=${signer}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )

    const data = await response.json();
    return data;
}

export const getOpenseaOfferData = async (
    orderId: string,
    signer: string
) => {

    const response = await fetch(
        `https://stage.api.didhub.com/nftmarketplace/v1/opensea/offer?orderId=${orderId}&signer=${signer}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )

    const data = await response.json();
    return data;
}
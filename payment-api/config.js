module.exports = {
  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? '',
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? '',
  clientId: process.env.CLIENT_ID ?? '',
  clientSecret: process.env.CLIENT_SECRET ?? '',
  jwksUri: process.env.JWKS_URI ?? '',
  auctionApiBaseUrl: process.env.AUCTION_API_BASE_URL ?? '',
};

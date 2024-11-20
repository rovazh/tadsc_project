module.exports = {
  clientId: process.env.CLIENT_ID ?? '',
  jwksUri: process.env.JWKS_URI ?? '',
  dbUrl: process.env.DB_URL ?? '',
  userApiBaseUrl: process.env.USER_API_BASE_URL ?? '',
  paymentApiBaseUrl: process.env.PAYMENT_API_BASE_URL ?? '',
};

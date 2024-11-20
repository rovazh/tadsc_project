module.exports = {
  clientId: process.env.CLIENT_ID ?? '',
  jwksUri: process.env.JWKS_URI ?? '',
  dbUrl: process.env.DB_URL ?? '',
}

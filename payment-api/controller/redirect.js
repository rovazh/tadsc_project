const { clientId, clientSecret, auctionApiBaseUrl } = require('../config');

const fetchToken = async () => {
  const res = await fetch('https://testtesttestm2m.auth.us-east-2.amazoncognito.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });
  const token = await res.json();
  return token.access_token;
}

const closeLot = async (paymentId) => {
  return await fetch(`${auctionApiBaseUrl}/lot/${paymentId}/close`, {
    method: 'POST',
    headers: {
      Authorization: await fetchToken(),
      Accept: 'application/json',
    }
  });
}

const handlePaymentSuccess = async (req, res, next) => {
  try {
    const { token } = req.query;
    await closeLot(token);
    return res.status(200).end('<html lang="en"><head><title>Success</title></head><body><h1>Payment successful</h1></body></html>');
  } catch (e) {
    next(e);
  }
}

const handlePaymentCancel = (_, res) => {
  return res.status(200).end('<html lang="en"><head><title>Canceled</title></head><body><h1>Payment canceled</h1></body></html>');
}

module.exports = {
  handlePaymentSuccess,
  handlePaymentCancel,
};

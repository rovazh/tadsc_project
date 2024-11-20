const Joi = require('joi');
const { paypalClientId, paypalClientSecret } = require('../config');

const lotSchema = Joi.object({
  lotName: Joi.string().min(3).max(30).required(),
  price: Joi.number().greater(0).required(),
  currencyCode: Joi.string().valid('USD').required(),
});

const fetchToken = async () => {
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + btoa(paypalClientId + ':' + paypalClientSecret),
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });
  const token = await res.json();
  return token.access_token;
}

const createOrder = async ({ name, price, currencyCode }) => {
  const res = await fetch('https://api.sandbox.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + await fetchToken(),
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: price,
            breakdown: {
              lot_total: {
                currency_code: currencyCode,
                value: price
              }
            }
          },
          lots: [
            {
              name: name,
              quantity: 1,
              unit_amount: {
                currency_code: currencyCode,
                value: price
              }
            }
          ]
        }
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            landing_page: "GUEST_CHECKOUT",
            user_action: "PAY_NOW",
            return_url: "http://localhost:3002/payment-success",
            cancel_url: "http://localhost:3002/payment-cancel"
          }
        }
      }
    }),
  });
  const jsonRes = await res.json();
  return {
    userActionUrl: jsonRes.links[1].href,
    id: jsonRes.id,
  }
}

const createPayment = async (req, res, next) => {
  try {
    const { error, value } = lotSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    const order = await createOrder({
      name: value.lotName,
      price: value.price,
      currencyCode: value.currencyCode,
    });
    if (!order.userActionUrl || !order.id) {
      return res.status(500).end();
    }
    return res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPayment,
}

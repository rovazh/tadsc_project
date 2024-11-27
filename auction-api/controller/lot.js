const Lot = require('../model/Lot');
const Joi = require('joi');
const { userApiBaseUrl, paymentApiBaseUrl } = require('../config');

const lotSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  startingPrice: Joi.number().required(),
  currencyCode: Joi.string().valid('USD').required(),
});

const getUser = async (userID, token) => {
    const res = await fetch(`${userApiBaseUrl}/user/${userID}`, {
      method: 'GET',
      headers: {
        Authorization: token,
        Accept: 'application/json',
      },
    });
    if (res.status !== 200) {
      throw new Error("User API responded with status: "+res.status);
    }
    return await res.json()
}

const createOrder = async ({ name, price, currencyCode }, token) => {
  const res = await fetch(`${paymentApiBaseUrl}/order`, {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lotName: name,
      price: price,
      currencyCode: currencyCode,
    }),
  });
  if (res.status !== 201) {
    throw new Error('Failed to process payment');
  }
  return await res.json();
}

const createLot = async (req, res, next) => {
  try {
    const { error, value } = lotSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    const lot = new Lot();
    lot.name = value.name;
    lot.startingPrice = value.startingPrice;
    lot.actualPrice = value.startingPrice;
    lot.currencyCode = value.currencyCode;
    await lot.save();
    return res.status(200).json({
      name: lot.name,
      startingPrice: lot.startingPrice,
      actualPrice: lot.actualPrice,
      currencyCode: lot.currencyCode,
      id: lot.id,
      winnerId: lot.winnerId,
      lastBidderId: lot.lastBidderId,
      status: lot.status,
      paymentId: lot.paymentId,
    });
  } catch (err) {
    next(err);
  }
}

const readLot = async (req, res, next) => {
  try {
    const lot = await Lot.findOne({ _id: req.params.lotID }).exec();
    if (!lot) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    return res.status(200).json({
      id: lot.id,
      name: lot.name,
      startingPrice: lot.startingPrice,
      actualPrice: lot.actualPrice,
      currencyCode: lot.currencyCode,
      winnerId: lot.winnerId,
      lastBidderId: lot.lastBidderId,
      status: lot.status,
      paymentId: lot.paymentId,
    });
  } catch (err) {
    next(err);
  }
}

const updateLot = async (req, res, next) => {
  try {
    const { error, value } = lotSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    const lot = await Lot.findOne({ _id: req.params.lotID }).exec();
    if (!lot) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    lot.name = value.name;
    lot.startingPrice = value.startingPrice;
    lot.currencyCode = value.currencyCode;
    await lot.save();
    return res.status(200).json({
      id: lot.id,
      name: lot.name,
      startingPrice: lot.startingPrice,
      actualPrice: lot.actualPrice,
      currencyCode: lot.currencyCode,
      winnerId: lot.winnerId,
      lastBidderId: lot.lastBidderId,
      status: lot.status,
      paymentId: lot.paymentId,
    });
  } catch (err) {
    next(err);
  }
}

const deleteLot = async (req, res, next) => {
  try {
    const lot = await Lot.findOne({ _id: req.params.lotID }).exec();
    if (!lot) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    await lot.deleteOne({ _id: lot.id });
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}

const readLots = async (req, res, next) => {
  try {
    const lots = await Lot.find().exec();
    return res.status(200).json(lots.map(lot => ({
      id: lot.id,
      name: lot.name,
      startingPrice: lot.startingPrice,
      actualPrice: lot.actualPrice,
      currencyCode: lot.currencyCode,
      winnerId: lot.winnerId,
      lastBidderId: lot.lastBidderId,
      status: lot.status,
      paymentId: lot.paymentId,
    })));
  } catch (err) {
    next(err);
  }
}

const readWinner = async (req, res, next) => {
  try {
    const lot = await Lot.findOne({ _id: req.params.lotID }).exec();
    if (!lot || !lot.winnerId) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    const user = await getUser(lot.winnerId, req.get('Authorization'));
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    return res.status(200).json(user);
  } catch (e) {
    next(e);
  }
}

const reserveLot = async (req, res, next) => {
  try {
    const lot = await Lot.findOne({ _id: req.params.lotID }).exec();
    if (!lot) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    if (lot.status !== 'open' || !lot.lastBidderId) {
      return res.status(400).json({
        error: 'Lot must be open and have a bidder',
      });
    }
    lot.status = 'reserved';
    lot.winnerId = lot.lastBidderId;
    await lot.save();
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}

const closeLot = async (req, res, next) => {
  try {
    const lot = await Lot.findOne({ paymentId: req.params.paymentID }).exec();
    if (!lot) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    if (lot.status !== 'reserved') {
      return res.status(400).json({
        error: 'Lot must be reserved',
      });
    }
    lot.status = 'closed';
    await lot.save();
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}

const bidSchema = Joi.object({
  bid: Joi.number().required(),
});

const bidForLot = async (req, res, next) => {
  try {
    const { error, value } = bidSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    const user = await getUser(req.params.userID, req.get('Authorization'));
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    const lot = await Lot.findOne({ _id: req.params.lotID }).exec();
    if (!lot) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    if (lot.status !== 'open') {
      return res.status(400).json({
        error: 'Lot must be open',
      });
    }
    if (lot.startingPrice >= value.bid || lot.actualPrice >= value.bid) {
      return res.status(400).json({
        error: 'Invalid price',
      });
    }
    lot.actualPrice = value.bid;
    lot.lastBidderId = user.id;
    await lot.save();
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
}

const purchaseLot = async (req, res, next) => {
  try {
    const token = req.get('Authorization');
    const user = await getUser(req.params.userID, token);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    const lot = await Lot.findOne({ _id: req.params.lotID }).exec();
    if (!lot) {
      return res.status(404).json({
        error: 'Not Found',
      })
    }
    if (lot.winnerId !== user.id || lot.paymentId) {
      return res.status(400).json({
        error: 'Invalid payer',
      });
    }
    if (lot.status !== 'reserved') {
      return res.status(400).json({
        error: 'Lot must be reserved',
      });
    }
    const order = await createOrder({
      name: lot.name,
      price: lot.actualPrice,
      currencyCode: lot.currencyCode,
    }, token);
    lot.paymentId = order.id;
    lot.save();
    return res.status(200).json({
      userActionUrl: order.userActionUrl,
    })
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createLot,
  readLot,
  updateLot,
  deleteLot,
  readLots,
  readWinner,
  reserveLot,
  closeLot,
  bidForLot,
  purchaseLot,
}

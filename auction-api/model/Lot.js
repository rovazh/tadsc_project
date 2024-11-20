const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startingPrice: {
    type: Number,
    required: true,
  },
  actualPrice: {
    type: Number,
    required: true,
  },
  currencyCode: {
    type: String,
    required: true,
    enum: ['USD'],
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'reserved', 'closed'],
    default: 'open',
  },
  winnerId: {
    type: String,
    default: '',
  },
  lastBidderId: {
    type: String,
    default: '',
  },
  paymentId: {
    type: String,
    default: '',
  }
});

const Lot = mongoose.model('Lot', schema);

module.exports = Lot;

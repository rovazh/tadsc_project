const {createPayment} = require("../controller/payment");
const router = require('express').Router();

router.post('/order', createPayment);

module.exports = router;

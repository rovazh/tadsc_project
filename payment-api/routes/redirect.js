const { handlePaymentSuccess, handlePaymentCancel } = require("../controller/redirect");
const router = require('express').Router();

router.get('/payment-success', handlePaymentSuccess);
router.get('/payment-cancel', handlePaymentCancel);

module.exports = router;

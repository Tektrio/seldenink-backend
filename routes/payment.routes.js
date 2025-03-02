const express = require('express');
const router  = express.Router();
const createCheckoutSession = require('../payment/checkout');
const webhook = require('../payment/webhook');

router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', webhook);

module.exports = router;
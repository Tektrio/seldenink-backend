const express = require('express');
const router  = express.Router();
const mailerController = require('../controller/mailer.controller');

router.post('/sendmailer', mailerController.sendMailer);

module.exports = router; 
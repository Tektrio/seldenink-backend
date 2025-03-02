const express        = require('express');
const router         = express.Router();
const sendController = require('../controller/sendmailer.controller');

router.post('/sendmailer', sendController.sendMailer);

module.exports = router;
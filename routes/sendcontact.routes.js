const express = require('express');
const router  = express();
const contactController = require('../controller/sendcontact.controller');

router.post('/sendcontact', contactController.sendContact);

module.exports = router;

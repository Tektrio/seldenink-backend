const express = require('express');
const router  = express.Router();
const imgurlController = require('../controller/imgurl.controller');

router.get('/albums', imgurlController.getImagesImgur);


module.exports = router;
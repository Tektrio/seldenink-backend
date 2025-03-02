const express      = require('express');
const router       = express.Router();
const flickrRouter = require('../controller/flickr.controller'); 

router.get('/flickr/photos', flickrRouter.getFlickPhotos);
router.get('/flickr/photos/new', flickrRouter.getFlickrPhotosRight);

module.exports = router;
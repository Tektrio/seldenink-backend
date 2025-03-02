const axios = require('axios');

exports.getFlickPhotos = (req,res) => {
    const API_KEY = '68bdbe185772be89539e2dd422cecdb1';
    const userID = '198949775@N08';
    
    axios.get(`https://www.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${API_KEY}&user_id=${userID}&extras=tags&format=json&nojsoncallback=1`)
        .then(data => res.status(200).json(data.data.photos.photo))
        // .then(data => res.status(200).json(data.data))
        .catch(err => res.status(500).json({ error: 'Internal error on fetch data'}))
}


exports.getFlickrPhotosRight = (req,res) => {
    const API_KEY = '2ac10d36f99c091b4fa0dd74769fc6f0';
    const userID = '198849764@N07';
    
    axios.get(`https://www.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${API_KEY}&user_id=${userID}&extras=tags&format=json&nojsoncallback=1`)
        .then(data => res.status(200).json(data.data.photos.photo))
        .catch(err => res.status(500).json({ error: 'Internal error on fetch data'}))
}
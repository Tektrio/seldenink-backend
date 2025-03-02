const axios = require('axios');

exports.getImagesImgur = async (req,res) => {
        try {
            const albumHash = 'zl5t2Ev';
            // const albumHash = '4ZSr05P';
            // const albumIDS = ['4ZSr05P'];
            const clientId = '689e169cb7e56f9';
            
            const response = await axios.get(`https://api.imgur.com/3/album/${albumHash}/images`, {
                headers: {
                    Authorization: `Client-ID ${clientId}`
                }
            });
    
            if(response.status == 200){
                res.status(200).json(response.data);
            }
        }catch(err){
            console.error(err);
        }
}
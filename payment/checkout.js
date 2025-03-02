const stripeApi = require('./stripe')
const dotenv = require('dotenv')

dotenv.config({ path: '../config/config.env' })

async function createCheckoutSession(req,res){
    const domainUrl = process.env.WEB_APP_URL; 
    const { line_items, customer_email } = req.body;

    if(!line_items || !customer_email){
        return res.status(400).json({ error: 'missing required session parameters. '})
    }

    let session;
    
    try {
        session = await stripeApi.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            customer_email,
            success_url: `${domainUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainUrl}/canceled`,
            shipping_address_collection: { allowed_countries: ['US','PT']}
        })

        res.status(200).json({ sessionId: session.id })
    }catch(err){
        res.status(400).json({ error: 'An error occurs during trying to access checkout session' + err.message })
    }
}

module.exports = createCheckoutSession
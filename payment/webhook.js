const stripeApi = require('./stripe');

function webhook(req,res){
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeApi.webhooks.constructEvent(
            req['rawBody'],sig,process.env.WEB_HOOK_SECRET
        )
    }catch(err){
        return res.status(400).json({ error: `Webhook error: ${err.message}`})
    }

    if(event.type === 'checkout.session.completed'){
        const session = event.data.object;
        console.log('Session: ', session);

        console.log('Payment: ',session.payment_status)
    }
}

module.exports = webhook;
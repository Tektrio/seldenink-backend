const stripeApi = require('stripe')(process.env.STRIPE_SECRET_KEY)

module.exports = stripeApi
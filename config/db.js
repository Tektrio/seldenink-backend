const mongoose = require('mongoose');

// Connect to the database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


mongoose.connect(DB);

const connectAction = mongoose.connection;

// Listen for connection
connectAction.on('connected', () => console.log('stabilized connection'));

// Listen for error
connectAction.on('error', () => console.log('Cannot connect to the database...'));

// Export the connection.
module.exports = connectAction;
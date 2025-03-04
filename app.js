const express        = require('express');
const app            = express();
const PORT           = process.env.PORT || 3000;
const routerMailer   = require('./routes/sendmailer.routes'); 
const routerContact  = require('./routes/sendcontact.routes'); 
const routerImgur    = require('./routes/imgur.routes');
const flickrRouter   = require('./routes/flickr.routes');
const customerRouter = require('./routes/customer.routes');
const adminRouter    = require('./routes/admin.routes');
const bookNowRouter  = require('./routes/book-now.routes');
const mailRouter     = require('./routes/mailer.routes');
const { ErrorTrace } = require('./utils/ErrorTrace');
const dotenv         = require('dotenv');
const cors           = require('cors');
const cookieParser   = require('cookie-parser');
const helmet         = require('helmet');
const rateLimit      = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const createCheckoutSessionRouter = require('./routes/payment.routes');

const arrivalAlert = require('./utils/arrivalAlert');


const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app)


const io = new Server(server, {
    cors: {
        origin: ['https://selden.ink','http://localhost:5173','https://www.selden.ink'],
        methods:['GET','POST'],
        credentials: true
    }
})

io.on('connection', (socket) => {
    // console.log(socket.id)

    socket.on('receive_event', (data) => {
        socket.broadcast.emit('send_message', data);
    })

    socket.on('diconnect', () => {
        console.log('Disconnected')
    }) 
})

app.use((req,res,next) => {
    req.io = io;
    next();
})

dotenv.config({ path: './config/config.env' });

require('./config/db');

// Provide a layer to prevent hacker attack using http protocol 
app.use(helmet());


// Use rate limit from the begin of code always to prevent hacker attack against to try request until get the
const limit = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'To many request from this IP Address, please try again an hour.'
})

// Prenvent NoSQL Injection attack 
app.use(mongoSanitize());

// Prevent to xss attack comes from HTML


// cors options 
const corsOptions = {
    origin: ['http://localhost:5173', 'https://selden.ink'], // Domínios permitidos
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Métodos permitidos
    credentials: true, // Permitir cookies/autenticação
}


// Middlewares
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json({
    limit: '10kb',
    verify: (req,res,buffer) => req['rawBody'] = buffer
}))

app.use(express.urlencoded({ extended: false }))

// Routes
// app.use('/api', limit);
app.use(routerMailer);
app.use(routerContact);
app.use(routerImgur);
app.use(flickrRouter);
app.use('/api/v1', customerRouter);
app.use('/api/v1', adminRouter);
app.use('/api/v1', bookNowRouter)
app.use('/api/v1', createCheckoutSessionRouter);

// app.use('/api/usuarios', userRouter);
app.use('/recover', mailRouter);

// Get all errors
app.use(ErrorTrace);




// Listener  
server.listen(PORT, () => console.log('O servidor está rodando em localhost:3000'));
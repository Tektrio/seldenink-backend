const ErrorHandler = require('../utils/ErrorHandler');
const { sendToken} = require('../utils/sendToken');
const Customer     = require('../models/Customer');
const sendMailer   = require('../utils/sendEmail');
const crypto       = require('crypto');

exports.signup = async(req,res,next) => {
    const { name, email, phone, password, birth, confirmpassword } = req.body;

    if(!name || !email || !phone || !password || !birth || !confirmpassword){
        return next(new ErrorHandler('All fields are required!!!','fail',400)); 
    }

    if(password !== confirmpassword){
        return next(new ErrorHandler('Both password must be equal.','fail',400));
    }

    try {
        const customer_email = await Customer.findOne({ email });

        if(customer_email){
            return next(new ErrorHandler('This e-mail already exists on our system.','fail',400)); 
        }

        const customer = await Customer.create({
            name,
            email,
            phone,
            password,
            birth
        })

        sendToken(res,201,customer);
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));  
    }
}


exports.login = async(req,res,next) => {
    const { email, password } = req.body;

    if(!email || !password){
        return next(new ErrorHandler('Email or password CAN NOT be empty','fail',400));
    }

    try {
        // const customer = await Customer.findOne({ email }).select('+password');
        const customer = await Customer.findOne({ email }).select('+password');

        if(!customer){
            return next(new ErrorHandler('Your e-mail does not exists on our system!','fail',401));
        }

        const correct = await customer.correctPassword(password,customer.password);
        
        if(!customer || !correct){
            return next(new ErrorHandler('E-mail or password invalid!','fail',401));
        }

        sendToken(res,200,customer);
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err.message}`,'fail',500));
    }
}

exports.logout = (req,res,next) => {
    // res.cookie('token', null, {
    //     expires: new Date(Date.now()),
    //     httpOnly: true
    // })

    res.clearCookie('token');

    res.end();
}


// Send a email to recover on account 
exports.forgotPassword = async(req,res,next) => {
    const { email } = req.body;

    if(!email){
        return next(new ErrorHandler('Email field is required! please enter a valid e-mail!','fail', 400));
    }

    try {
        const user = await Customer.findOne({ email });

        // Verify if e-mail exists on the system
        if(!user){
            return next(new ErrorHandler('This e-mail does not exists on our system. Please create an account.','fail', 404));
        }

        const hashToken = user.generateHashToken();

        await user.save();

        const TokenURL = `${process.env.TEKTRIO_FRONTEND_URL_PRODUCTION}reset/password/${hashToken}`;

        const message  = `To reset your password, click on the following link: ${TokenURL}. If the link doesn't work, copy and paste it into your web browser's address bar.`;

        await sendMailer({
            to: email,
            subject: 'Recover password',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'We sent an email to recover your password, please check your inbox.'
        })

    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

// Reset password
exports.resetPassword = async(req,res,next) => {
    const { token } = req.params;
    const { password, confirmpassword } = req.body; 

    const customToken = crypto.createHash('sha256').update(token).digest('hex');

    if(!password || !confirmpassword){
        return next(new ErrorHandler('password or confirm password CAN NOT be empty. Please provide a password - confirm password','fail',400));
    }

    if(password !== confirmpassword){
        return next(new ErrorHandler('both fields must to be equal.','fail',400));
    }

    try {
        const user = await Customer.findOne({
            resetPasswordToken: customToken,
            resetPasswordTOkenExpires: {$gt: Date.now()}
        })

        if(!user){
            return next(new ErrorHandler('This user does not exists on our system.','fail',404))
        }

        user.password = password;

        user.resetPasswordToken = undefined;

        user.resetPasswordTOkenExpires = undefined;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Password was change successfuly, please login.'
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}

exports.resetCustomerDashboardPassword = async(req,res,next) => {
    const { password, confirmPassword, oldpassword } = req.body;

    if(!password || !confirmPassword || !oldpassword){
        return next(new ErrorHandler(`All fields are required!`,'fail',403));
    }

    try {
        const customer = await Customer.findOne({ _id: req.user.id }).select('+password');    
        const oldPassword = await customer.compareOldPassword(oldpassword);
    
        if(!oldPassword){
            return next(new ErrorHandler(`Your old password is incorrect. Please try again later.`,'fail',403));
        }

        if(password !== confirmPassword){
            return next(new ErrorHandler(`"Both the password and confirm password fields must match.`,'fail',403));
        }

        customer.password = password;
        
        await customer.save();
    
        res.status(200).json({
            status: 'success',
            customer
        })
    }catch(err){
        return next(new ErrorHandler(`Something went wrong ${err}`,'fail',500));
    }
}




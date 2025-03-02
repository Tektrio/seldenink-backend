const jwt = require('jsonwebtoken');

exports.sendToken = (res,statusCode,user) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

    res.cookie('token', token, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true
    })

    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        user
    })
}
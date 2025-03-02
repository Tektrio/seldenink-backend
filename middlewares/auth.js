const Customer = require("../models/Customer");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require('jsonwebtoken');

// Verifica se o usuário está autenticado
exports.isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Authenticate first before perform some action.', 'fail', 401));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await Customer.findOne({ _id: decode.id });

    next();
}

// Verifica se o usuário tem permissão
exports.permission = (...roles) => {
    return (req, res, next) => {
        if (!req.user.roles || !req.user.roles.some(role => roles.includes(role))) {
            return next(new ErrorHandler('You DO NOT have permission to perform this action.', 'fail', 403));
        }
        next();
    };
};

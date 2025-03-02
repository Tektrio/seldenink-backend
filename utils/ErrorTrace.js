exports.ErrorTrace = (err,req,res,next) => {
    const error = {
        statusCode: err.statusCode || 500,
        status: err.status || 'fail',
        message: err.message || 'Internal server error'
    }

    res.status(error.statusCode).json({
        status: error.status,
        message: error.message
    })
}
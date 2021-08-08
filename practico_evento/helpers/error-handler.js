function errorHandler(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({mensaje: "EL USUARIO NO ESTA AUTORIZADO"})
    }

    if (err.name === 'ValidationError') {
        //  validation error
        return res.status(401).json({mensaje: err})
    }

    // default to 500 server error
    return res.status(500).json(err);
}

module.exports = errorHandler;


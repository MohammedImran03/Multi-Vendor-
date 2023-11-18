const ErrorHandler = require("../utils/Errorhandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server Error Found";
  
    // Mongodb url connection error
    if (err.name === "CastError") {
      const message = `Resources not found with this url.. Invalid ${err.path}`;
      err = new ErrorHandler(message, 400);
    }
  
    // Duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate key ${Object.keys(err.keyValue)} Entered, Error Found`;
      err = new ErrorHandler(message, 400);
    }
  
    // wrong jwt error
    if (err.name === "JsonWebTokenError") {
      const message = `Your url is invalid, Json token Error please try again later`;
      err = new ErrorHandler(message, 400);
    }
  
    // jwt expired
    if (err.name === "TokenExpiredError") {
      const message = `Your Url is expired please try again later!`;
      err = new ErrorHandler(message, 400);
    }
  
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  };
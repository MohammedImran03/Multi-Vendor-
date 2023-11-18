const ErrorHandler =require("../utils/Errorhandler");
const catchAsyncErrors = require("./AsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

exports.isAuthenticated = catchAsyncErrors(async(req,res,next) => {
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please Sign in to Continue Your Shopping", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    next();
});

const express = require("express");
const User = require("../model/user.model");
const router = express.Router();
const ErrorHandler = require("../utils/Errorhandler");
const cloudinary = require('cloudinary');
const jwt = require("jsonwebtoken");
const path = require("path");
const sendMail =require("../utils/mailsender");
const catchAsyncErrors=require("../middleware/AsyncErrors");
const sendToken=require("../utils/sendjwttoken");
const {isAuthenticated} = require("../middleware/authentication.js");
//Create User Sign Up
router.post("/Sign-up", async (req, res, next) => {
      const { name, email, password, avatar,mobile } = req.body;
      try {
      const userEmail = await User.findOne({ email });
      if (userEmail) {
        return next(new ErrorHandler("User already exists Please try to SignUp with different Email", 400));
      }
    // const myCloud = await cloudinary.v2.uploader.upload(avatar, {
    //     folder: "avatars",
    //   });
    //   console.log(myCloud);
      const user = {
        name: name,
        email: email,
        password: password,
        mobile:mobile,
        avatar: {
            // public_id: myCloud.public_id,
            // url: myCloud.secure_url,
            url: avatar
        },
      };
      const activationToken = createActivationToken(user);
      const activationUrl = `http://localhost:3000/activation/${activationToken}`;
      try {
        // const createuser = await User.create(user);
        // if (createuser?._id) {
          await sendMail({
          email: user.email,
          subject: "Account Activation Link",
          message: `Hello ${user.name}, Please click on the link to activate your Vendor Bay account : ${activationUrl}\nNote:Link will Expires in 15 minutes`,
        });
            res.status(201).json({
                success: true,
                message: `please check your email ${user.email} to activate your Vendor Bay account!`,
              });
        //   } else {
        //     return next(new ErrorHandler("Registeration Failed Please Try again Later", 500));
        //   }
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
  });

  // create activation token for user
const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET_KEY, {
      expiresIn: "15m",
    });
  };
  
// activate user
  router.post("/activation",catchAsyncErrors(async (req, res, next) => {
      try {
        const { activation_token } = req.body;
  
        const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET_KEY);
        if (!newUser) {
          return next(new ErrorHandler("Invalid token", 400));
        }
        const { name, email, password, avatar,mobile } = newUser;
        let user = await User.findOne({ email });
        if (user) {
          return next(new ErrorHandler("User already exists", 400));
        }
        // else{
            user = await User.create({name, email, password, avatar,mobile});
            sendToken(user, 201, res);
        // }
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );

// User Sign In
router.post("/user-Sign-In",catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
    try {
      if (!email || !password) {
        return next(new ErrorHandler("Login Credentials Missing !", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User doesn't exists !", 400));
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Password Doesnot Match!, Please Provide Valid Information", 400)
        );
      }
      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get  user Details
router.get("/getuser",isAuthenticated,catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new ErrorHandler("User does not exists", 400));
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
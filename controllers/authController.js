const crypto = require('crypto');
const Users = require('../models/userModel');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');


const otpCache = new NodeCache({ stdTTL: 60 }); // TTL of 60 seconds


// Helper function to generate OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
const setCookie = (user, token, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
};
exports.signup = catchAsync(async (req, res, next) => {
  const {email}=req.body;
  const otp=generateOtp();
  otpCache.set(email, otp);

  const newUser = await Users.create(req.body);

  const url=`${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser,url).sendWelcome();

  const token = signToken(newUser._id);
  setCookie(newUser, token, res);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

//login controller

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) Check if email or password actually exists
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password', 400),
    );
  }
  //2) Check if user exists && password is correct
  const user = await Users.findOne({ email }).select('+password');
 
  if (
    !user ||
    !(await user.correctPassword(password, user.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3) If everything ok, send token to the client
  const token = signToken(user._id);
  setCookie(user, token, res);
  res.status(200).json({
    status: 'success',
    token,
  });
});

//log out controller

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's exist or not
  console.log('protect');
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in ! Please login', 401),
    );
  }

  // 2) Validate token / Verification of token
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const user = await Users.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user is no longer exists', 401));
  }

  // 4) Check if the user changed the password after the JWT was issued
  if (user.checkPasswordIsChanged(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed their password, Please login again',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = user;
  res.locals.user = user;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await jwt.verify(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // console.log(decoded, 'decoded');
      // 2) Check if user still exists
      const currentUser = await Users.findById(decoded.id);
      // console.log(currentUser, 'current User1');
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.checkPasswordIsChanged(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      // console.log(currentUser, ' current user2');
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// restrict the tour

exports.restrictTour = (...roles) => {
  return (req, res, next) => {
    // roles is an array and we can use it in this function because of the concept of clorsure
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403,
        ),
      );
    }
    next();
  };
};

// RESET PASSWORD FUNCTIONALITY
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await Users.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) Check the token is not expired and user exists and then set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Updated changedPaswordAt property for the user

  // 4) Log the user in and send JWT
  const token = signToken(user._id);
  setCookie(user, token, res);
  res.status(201).json({
    status: 'success',
    token,
  });
});

// FORGOT PASSWORD FUNCTIONALITY

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user on based on posted email
  const { email } = req.body;
  const user = await Users.findOne({ email });
  if (!user) {
    return next(
      new AppError('There is no user with that email', 404),
    );
  }
  // 2) Genrate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email

  try {
    const resetUrl = `${req.protocol}:://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

    new Email(user,resetUrl).sendPasswordReset();
    return res.status(200).json({
      status: 'success',
      message: 'Token sent to the email!',
    });
  } catch (err) {
    // console.log(err);
    user.passwordResetToken = undefined;
    user.passwordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error in sending email', 500),
    );
  }
});

// UPDATING PASSWORD WITHOUT FORGOTING IT
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const id = req.user._id;
  // console.log(id);
  const user = await Users.findById(id).select('password');
  // 2) Check if posted current password is correct or not
  if (
    !(await user.correctPassword(
      req.body.currentPassword,
      user.password,
    ))
  ) {
    return next(new AppError('Wrong password', 400));
  }
  // 3) If password is correct than update password
  user.password = req.body.updatedPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  // 4) Log user in , end JWT
  const token = signToken(user._id);
  setCookie(user, token, res);
  res.status(201).json({
    status: 'success',
    token,
  });
});
exports.createOTP=catchAsync(async(req,res,next)=>{

});
exports.verifyOTP=catchAsync(async(req,res,next)=>{

});
//Updating data of user

const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide a email'],
    unique: [true, 'User with this email already exist'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpeg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: 8,
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      //this only works on create and save!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: Date,
});
//document middleware

userSchema.pre('save', async function (next) {
  //only run this function if the password is modified
  if (!this.isModified('password')) {
    return next();
  }
  //hash the paasword with bcrypt
  this.password = await bcrypt.hash(this.password, 12);
  // console.log(this.password);
  //deleting confirm password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// query middleware

userSchema.pre(/^find/, function (next) {
  // this points to current query
  this.find({ active: { $ne: false } });
  next();
});

// ** this arer instancec methods for the documen of userSchema
//checking password;

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// this method is checking if the user change its password or not after the creation of jwt
userSchema.methods.checkPasswordIsChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return changedTimeStamp > JWTTimestamp;
  }
  // false means password is not changed
  return false;
};

// instance method for creating password token for reseting password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 5 * 60 * 1000; // Setting expiration to 5 minutes from now
  return resetToken;
};

module.exports = mongoose.model('Users', userSchema);

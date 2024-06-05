const multer = require('multer');
const sharp = require('sharp');
const Users = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage=multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users')
//   },
//   fileName:(req,file,cb)=>{
//     // we create file name by using this way: user-userId-currentTimeStamp.extension
//     const ext=file.minetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  // console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not image! Please upload only image', 400),
      false,
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
const uploadUserPhoto = upload.single('photo');

// Here we edit image because user can send any size of image
const resizeUserPhoto = catchAsync(async(req, res, next) => {
  if (!req.file) return next();
  req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
// ROUTING FOR USERS

const getAllUsers = factory.getAll(Users);

// Update current logged in user

const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update, please use update password route',
        400,
      ),
    );
  }
  // 2) Update user document
  // a) Filtered out unwanted fields which are not allowe to update
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await Users.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res) => {
  // console.log('hello');
  await Users.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
const createUser = (req, res) => {};

const getUser = factory.getOne(Users);

// DO NOT UPDATE PASSWORD WITH IT
const updateUser = factory.updateOne(Users);

const deleteUser = factory.deleteOne(Users);

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto
};

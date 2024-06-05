const express = require('express');

const {
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
} = require('../controllers/userController');
const {
  signup,
  login,
  resetPassword,
  forgotPassword,
  protect,
  updatePassword,
  restrictTour,
  logout,
} = require('../controllers/authController');

const userRouter = express.Router();


// user posts

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.get('/logout', logout);

userRouter.patch('/forgot-password', forgotPassword);
userRouter.patch('/reset-password/:token', resetPassword);

userRouter.use(protect);

userRouter.get('/me', getMe, getUser);
userRouter.patch(
  '/update-password',

  updatePassword,
);
userRouter.patch(
  '/update-user',
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe
);
userRouter.delete(
  '/delete-user',

  deleteMe,
);

//admin access
userRouter.use(restrictTour('admin'));
userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
userRouter.route('/').get(getAllUsers).post(createUser);

module.exports = userRouter;

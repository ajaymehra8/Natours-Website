const express = require('express');
const {
  overviewController,
  viewTourController,
  getLoginForm,
  getSignupForm,
  getAccount,
  getMyTours
} = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// client side routes
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  overviewController,
);

router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewTourController,
);

router.get('/login', authController.isLoggedIn, getLoginForm);

router.get('/signup', authController.isLoggedIn, getSignupForm);

router.get('/me', authController.protect, getAccount);
router.get('/my-tours', authController.protect,getMyTours);


module.exports = router;

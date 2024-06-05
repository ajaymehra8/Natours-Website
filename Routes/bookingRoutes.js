const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const Router = express.Router();

Router.use(authController.protect);

Router.get(
  '/checkout-session/:tourId',
  bookingController.getCheckoutSession,
);

Router.use(authController.restrictTour('admin', 'lead-guide'));

Router.route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

Router.route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.deleteBooking)
  .patch(bookingController.updateBooking);

module.exports = Router;

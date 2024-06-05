const express = require('express');
const authController = require('../controllers/authController');
const Router = express.Router({ mergeParams: true });
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserId,
  getReview,
} = require('../controllers/reviewControler');

Router.use(authController.protect);
Router.route('/')
  .post(
    authController.restrictTour('user'),
    setTourUserId,
    createReview,
  )
  .get(getAllReviews);
Router.route('/:id')
  .delete(deleteReview)
  .patch(authController.restrictTour('admin','user'),updateReview)
  .get(authController.restrictTour('admin','user'),getReview);

module.exports = Router;

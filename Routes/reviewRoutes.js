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
  getReviewsOfUser
} = require('../controllers/reviewControler');

Router.use(authController.protect);
Router.get('/my-reviews',getReviewsOfUser);
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
Router.route('/:user');

module.exports = Router;

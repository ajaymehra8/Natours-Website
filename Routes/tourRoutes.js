const express = require('express');
const {
  postTour,
  getTour,
  getTours,
  deleteTour,
  updateTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImgs,
  resizeTourImgs
} = require('../controllers/tourController');
const reviewController = require('../controllers/reviewControler');
const reviewRouter = require('../Routes/reviewRoutes');
const {
  protect,
  restrictTour,
} = require('../controllers/authController');
const tourRouter = express.Router();

//middleware
const aliasTopTour = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//IMPLEMENTING NESTED ROUTES FOR REVIEWS

// tourRouter
//   .route('/:tourId/reviews')
//   .post(
//     protect,
//     restrictTour('user'),
//     reviewController.createReview,
//   );

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.route('/tour-stats').get(getTourStats);
tourRouter.route('/monthly-plan/:year').get(protect, restrictTour('admin', 'lead-guide','guide'),getMonthlyPlan);

tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);

tourRouter.route('/top-5').get(aliasTopTour, getTours);
tourRouter
  .route('/')
  .get(getTours)
  .post(protect, restrictTour('admin', 'lead-guide'), postTour);
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTour('admin', 'lead-guide'),uploadTourImgs,resizeTourImgs,updateTour)
  .delete(protect, restrictTour('admin', 'lead-guide'), deleteTour);

module.exports = tourRouter;

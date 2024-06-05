const Review = require('../models/reviewModel');
const factory=require('./handlerFactory');

// Controller for getting all reviews
const getAllReviews =factory.getAll(Review);

const setTourUserId=(req,res,next)=>{
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
}
// Controller for creating reviews
const createReview = factory.createOne(Review);
const deleteReview=factory.deleteOne(Review);

const updateReview=factory.updateOne(Review);
const getReview=factory.getOne(Review);
module.exports = {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserId,
  getReview
};



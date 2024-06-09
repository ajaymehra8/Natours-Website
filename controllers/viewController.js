
const Tour=require('../models/tourModel');
const Review=require('../models/reviewModel');

const AppError = require('../utils/appError');
const catchAsync=require('../utils/catchAsync');
const User=require('../models/userModel');
const Booking=require('../models/bookingModel');

exports.overviewController = catchAsync(async(req, res) => {
// 1) get all the tours from our collection
const tours=await Tour.find();


// 2) Build Template
// 3) Render that template using data from tour

  res.status(200).render('overview',{
    title:'All Tours',
    tours
  });
});
exports.viewTourController = catchAsync(async(req, res,next) => {
const tour=await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    fields:'review rating '
});
if(!tour){
  return next(new AppError('There is no tour with that name',400));
}
  res.status(200).render('tour',{
    titel:tour.name,
    tour
  });
});
exports.getLoginForm=catchAsync(async(req,res)=>{
  res.status(200).render('login',{
    title:'Log in to your account'
  })
})
exports.getSignupForm=catchAsync(async(req,res)=>{
  res.status(200).render('signup',{
    title:'Create new account'
  })
})
exports.getAccount=catchAsync(async(req,res)=>{

  res.status(200).render('account',{
title:'Your Account'

  }); 
});
exports.getReviewsOfUser=catchAsync(async(req,res)=>{
  const reviews=await Review.find({user:req.user.id});
  console.log(reviews);
  res.status(200).render('review',{
    totalReviews:reviews.length,
    reviews
  })
  })
exports.getMyTours=catchAsync(async(req,res,next)=>{
// 1) Find All booking
// console.log('hello');
const bookings=await Booking.find({user:req.user.id});
if(bookings.length<=0){
  return res.status(200).render('noBookings');
}
// 2) Find tours with returned id
const tourIds=bookings.map(el=>el.tour);
const tours=await Tour.find({_id:{$in:tourIds}});

res.status(200).render('overview',{
  title:"My Tours",
  tours
})
});

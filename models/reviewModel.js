const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
      required: [true, 'Review must belongs to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path:'tour',
  //   select:'name',})
  //   .populate({
  //     path:'user',
  //     select:'name photo'
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
// static method

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // here this point to current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats.length>0);
  if(stats.length>0){

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
}else{
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: 4.5,
    ratingsQuantity: 0,
  });
}
};
reviewSchema.post('save', function () {
  // this points to current review(document)
  // this.constructor points to the current model
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
// reviewSchema.pre(/^findOneAnd/, async function(next) {
//   console.log(this);
//   this.r = await this.find();
//   // console.log(this.r);
//   next();
// });

reviewSchema.post(/^findOneAnd/,async function(doc){
  // this.r =await  this.findOne(); // THIS IS NOT WORKING HERE BECAUSE THE QUERY  ALREADY EXECUTED BEFORE IT
// console.log(doc);
  await doc.constructor.calcAverageRatings(doc.tour);
})
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

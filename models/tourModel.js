const slugify = require('slugify');
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        'Tour name is required',
      ],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name must have less than or equal to 40 characters',
      ],
      minLength: [
        10,
        'A tour name must have more than or equal to 10 characters',
      ],
      // validator:[validator.isAlpha,"Name can only contain letters"],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [
        true,
        'Duration of the tour is required',
      ],
    },
    maxGroupSize: {
      type: Number,
      required: [
        true,
        'Group size should be mentioned',
      ],
    },
    difficulty: {
      type: String,
      required: [
        true,
        'Difficulty level of the tour must be required',
      ],
      enum: {
        values: [
          'easy',
          'medium',
          'difficult',
        ],
        message:
          'Difficult is either easy,medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [
        1,
        'Rating must be have 1 star',
      ],
      max: [
        5,
        "Rating can't be greater than 5",
      ],
      set:val=>Math.round(val*10)/10
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [
        true,
        'Tour price is required',
      ],
    },

    priceDiscount: {
      type: Number,
      //this is a   CUSTOM VALIDATOR
      validate: {
        message:
          'Discount price should be below from regular price',
        validator: function (val) {
          // here this points to only current docs on new document creation , it not works at the time of updation
          return val < this.price;
        },
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [
        true,
        'A tour must has summary',
      ],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [
        true,
        'A tour must have a cover image',
      ],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON is used to Geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
      },
    ],
   
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// tourSchema.index({price:1});
tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:'2dsphere'});

tourSchema
  .virtual('durationWeeks')
  .get(function () {
    return this.duration / 7;
  }); // use of virtual property which is not stored in database

// Use of virtual populate

tourSchema.virtual('reviews',{
ref:'Review',
foreignField:'tour',
localField:'_id'
});

//MONGOOSE MIDDLEWARE


//1) DOCUMENT MIDDLEWARE
//this is a document middleware of mongoose ,it run before save and .create command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
}); //middlewares in mongoose
tourSchema.pre(
  /^find/,
  function (next) {
    this.populate({
      path: 'guides',
      select:
        '-__v -passwordChangedAt -passwordResetExpires -passwordResetToken',
    });
    next();
  },
);
// EMBENDING USERS  BUT IT IS NOT GOOD APPROCH SO WE USE REFRENCING INSTEAD OF EMBEDING

// tourSchema.pre('save', async function (next){
//  const guidesPromises= this.guides.map(async(id)=>{
//     return (await User.findById(id));
//   })
// this.guides=await Promise.all(guidesPromises);
//   next();
// });

//post middleware, it run after the hook in below case hook is 'save'
// tourSchema.post('save',function(doc,next){
//   console.log(doc);
//   next();
// })

//2) QUERY MIDDLEWARE
// THIS middleware are executed before or after the any query execution.
tourSchema.pre('find', function (next) {
  // here this keyword points to the current query not the current document
  this.find({
    secretTour: { $ne: true },
  });
  next();
});

//2) AGGREGATION MIDDLEWARE
//
// tourSchema.pre(
//   'aggregate',
//   function (next) {
//     //here this keyword is pointing to the current aggeregation object
//     this.pipeline().unshift({
//       $match: {
//         secretTour: { $ne: true },
//       },
//     });
//     next();
//   },
// );

const Tour = mongoose.model(
  'Tour',
  tourSchema,
);
module.exports = Tour;

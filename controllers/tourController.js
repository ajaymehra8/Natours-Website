const multer=require("multer");
const sharp=require("sharp");
const fs = require('fs');
const Tours = require('../models/tourModel');
const catchAsync = require("../utils/catchAsync");
const factory=require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  // console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not image! Please upload only image', 400),
      false,
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
const uploadTourImgs = upload.fields([
  {name:'imageCover',maxCount:1},
  {name:'images',maxCount:3}
]);
//upload.array('img',5) this is used when we have only one fields
//ROUTING FUNCTION for TOURS
const resizeTourImgs=catchAsync(async(req,res,next)=>{
  if (!req.files.imageCover || !req.files.images) return next();
  // 1) Cover Image
  const imageCoverFilename=`tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);

    req.body.imageCover=imageCoverFilename;


  // 2) Other images
  req.body.images=[];
await Promise.all(req.files.images.map(async(file,i)=>{
  const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
  await sharp(file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${filename}`);
    req.body.images.push(filename);
}))
  next();
});

const getTours =factory.getAll(Tours);
const getTour =factory.getOne(Tours,{path:'reviews'});

const postTour = factory.createOne(Tours);

const updateTour = factory.updateOne(Tours);

const deleteTour=factory.deleteOne(Tours);

// const deleteTour = catchAsync(async (req, res, next) => {
//   const deletedTour = await Tours.findByIdAndDelete(req.params.id);

//   if (!deletedTour) {
//     return next(new AppError("No tour found with that id", 404));
//   }
//   res.status(200).json({
//     success: true,
//     results: Tours.length,
//     deletedTour,
//   });

// });




const getTourStats = catchAsync(async (req, res, next) => {

  const stats = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      stats,
    },
  });

});

const getMonthlyPlan = catchAsync(async (req, res, next) => {

  const year = req.params.year * 1;

  const plan = await Tours.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    {
      $group: {
        _id: { $month: `$startDates` },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    },
    {
      $limit: 12
    }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      plan,
    },
  });


});
// /tours-within/:distance/center/latlng/unit/:unit
const getToursWithin=catchAsync(async(req,res)=>{
const {distance,unit,latlng}=req.params;
const [lat,lng]=latlng.split(',');
const radius=unit ==='mi'?distance/3963.2 : distance/6378.1;

if(!lat || !lng){
  next(new AppError('Please provide lattitude and longitude in the format',400));
}
const tours=await Tours.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}});
// console.log(tours);
// console.log(distance,unit,lat,lng,radius);

res.status(200).json({
  status:'success',
  results:tours.length,
  data:{
    data:tours
  }
});
});

const getDistances = catchAsync(async (req, res) => {
  const { unit, latlng } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier=unit==="mi"?0.00062137 : 0.001;

  if (!lat || !lng) {
    return next(new AppError('Please provide latitude and longitude in the correct format', 400));
  }

  const distances = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier:multiplier
      }
    },
    {
      $project:{
        distance:1,
        name:1
      }
    }
    
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});

module.exports = {
  updateTour,
  deleteTour,
  postTour,
  getTour,
  getTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImgs,
  resizeTourImgs
};

const catchAsync=require("../utils/catchAsync");
const AppError=require("../utils/appError");
const APIFeatures = require('../utils/apiFeatures');


exports.deleteOne=Model=>catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
  
    if (!doc) {
      return next(new AppError("No document found with that id", 404));
    }
    res.status(200).json({
      success: true,
      results: doc.length,
       doc,
    });
  
  });

  exports.updateOne=Model=>catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    if (!doc) {
      return next(new AppError("No doc found with that id", 404));
    }
     
    res.status(200).json({
      success: true,
      data: {
        doc,
      },
    });
  
  });

  exports.createOne=Model=>catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  
  });

  exports.getOne=(Model,popOptions)=> catchAsync(async (req, res, next) => {
    let query=Model.findById(req.params.id);
    if(popOptions){
      query.populate(popOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError("No doc found with that id", 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  
  });

  exports.getAll=(Model,popOptions)=>catchAsync(async (req, res, next) => {

    let filter = {};
  if (req.params.tourId) {
    filter = {
      tour: req.params.tourId,
    };
  }

    //This function known as route handler
    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const docs= await features.query.explain();
    const docs= await features.query;

  
    res.status(200).json({
      success: true,
      results: docs.length,
      data: {docs  },
    });
  
  });


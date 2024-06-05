const Tours = require('../models/tourModel');
const catchAsync = require("../utils/catchAsync");
const factory=require('./handlerFactory');
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking=require('../models/bookingModel');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get current booked tour
  try {
    const tour = await Tours.findById(req.params.tourId);
    // console.log(tour, req.user.email);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tour.name,
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    });

    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    // console.log(err);
    next(err);
  }
});

exports.createBookingCheckout=catchAsync(async(req,res,next)=>{
  const {tour,user,price}=req.query;
  // console.log(tour,user,price);
  if(!tour && !user && !price){
    // console.log("hey");
   return next();
  }
  await Booking.create({tour,user,price});
res.redirect(req.originalUrl.split('?')[0]);
})
exports.createBooking=factory.createOne(Booking);
exports.getBooking=factory.getOne(Booking);
exports.getAllBookings=factory.getAll(Booking);
exports.updateBooking=factory.updateOne(Booking);
exports.deleteBooking=factory.deleteOne(Booking);
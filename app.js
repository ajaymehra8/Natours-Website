require('dotenv').config();
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const mongoose = require('mongoose');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const bookingRouter = require('./Routes/bookingRoutes');

const reviewRouter=require('./Routes/reviewRoutes');
const viewRouter=require('./Routes/viewRoutes');
const errorController = require('./controllers/errorController');
const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser=require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path=require('path');
const compression=require('compression');


//db connection
const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('db connected successfully');
  } catch (err) {
    console.log(err);
    console.log('problem in connecting database');
  }
};
db();

const app = express();



app.set("view engine",'pug');// here we set our template engine which we used to client side rendering 
app.set('views',path.join(__dirname,'views'));

//Middlewares
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));// It is used as a body-parser
app.use(express.urlencoded({extended:true,limit:'10kb'}));// It is used to access form data from req.body
app.use(cookieParser());
// app.use(helmet());
app.use(express.static(`${__dirname}/public`))
// Data santization against NOSql query injection
app.use(mongoSanitize());

// Data santization Cross side scripting attacks
app.use(xss());

//Gloabal middleware
const options = {
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this ip, please try again an hour!',
};
const limiter = rateLimit(options);
app.use('/api', limiter);

// Attach the Router to the main application
app.use('/',viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/booking',bookingRouter);



// it prevent http parameter polution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());
app.all('*', (req, res, next) => {
  //app.all use for all type of get request like get,post,patch,delete * used for all other request
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
errorController(err, req, res, next);
});
// listening to the port
const server = app.listen(8000, () => {
  console.log('Listening at 8000');
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection! Shutting Down the app....');
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception! Shutting Down the app....');

  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

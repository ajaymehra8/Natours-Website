const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');


require('dotenv').config();

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

//read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//import data into database

const importedData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users,{validateBeforeSave:false});
    await Review.create(reviews);

    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
};

//   delete data from database

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data deleted successfully');
  } catch (err) {
    console.log(err);
  }
};

if(process.argv[2]=="--import") importedData();
if(process.argv[2]=="--delete") deleteData();
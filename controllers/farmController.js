const axios = require('axios');
const Farm = require('../models/farmModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Fetch weather data from Flask API
const fetchWeatherData = async (coordinates, time) => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/get_data', {
      params: {
        y: coordinates[0],
        x: coordinates[1],
        time: time,
      },
    });
    return response.data;
  } catch (error) {
    throw new AppError('Failed to fetch weather data from Flask API', 500);
  }
};

exports.getAllFarms = factory.getAll(Farm, 5); // Admin with limit 5
exports.getUserFarms = factory.getAll(Farm, 3); // User with limit 3

exports.setUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// exports.createFarms = factory.createOne(Farm);

exports.createFarms = catchAsync(async (req, res, next) => {
  const { Location, time } = req.body;
  if (!req.body.user) req.body.user = req.user.id;

  if (!Location || !Location.coordinates || !time) {
    return next(
      new AppError('Please provide location coordinates and time', 400),
    );
  }

  // Fetch weather data from Flask API
  const weatherData = await fetchWeatherData(Location.coordinates, time);

  // Add weather data to the request body
  req.body.weatherData = weatherData;

  const doc = await Farm.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.getFarm = factory.getOne(Farm);

exports.deleteFarm = factory.deleteOne(Farm);

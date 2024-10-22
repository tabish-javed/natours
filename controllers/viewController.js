import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const getOverview = catchAsync(async function (request, response) {
  // response.set("Content-Security-Policy", "default-src 'self'");

  // 1- Get tour data from collection
  const tours = await Tour.find();

  // 2- Build template

  // 3- Render that template using the data from 1
  response.status(200).render('overview', {
    title: 'All Tours',
    tours: tours
  });
});


const getTour = catchAsync(async function (request, response, next) {
  // 1- get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2- build template
  // 3- render template using data from 1
  response.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
  });
});


const getLoginForm = function (request, response) {
  response.status(200).render('login', { title: 'Log into your account!' });
};


const getAccount = function (request, response) {
  response.status(200).render('account', { title: 'Your account' });
};

// this handler function support update user data without API call
// (when using form's default POST on submit)
const updateUserData = catchAsync(async function (request, response) {
  const updatedUser = await User.findByIdAndUpdate(request.user.id, {
    name: request.body.name,
    email: request.body.email
  },
    {
      new: true,
      runValidators: true
    });
  response.status(200).render('account', { title: 'Your account', user: updatedUser });
});

const getMyTours = catchAsync(async (request, response, next) => {
  // 1- Find all bookings
  const bookings = await Booking.find({ user: request.user.id });

  // 2- Find tours with the returned IDs
  const tourIDs = bookings.map(element => element.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  response.status(200).render('overview', {
    title: 'My Tours',
    tours: tours
  });
});


export default {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours
};
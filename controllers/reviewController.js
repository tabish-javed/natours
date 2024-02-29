// import catchAsync from './../utils/catchAsync.js';
import Review from './../models/reviewModel.js';
import factory from './handlerFactory.js';


function setTourUserIDs (request, response, next) {
  // Allow nested routes
  if (!request.body.tour) request.body.tour = request.params.tourID;
  if (!request.body.user) request.body.user = request.user.id;
  next();
}


const getAllReviews = factory.getAll(Review);
const getReview = factory.getOne(Review);
const createReview = factory.createOne(Review);
const updateReview = factory.updateOne(Review);
const deleteReview = factory.deleteOne(Review);

export default {
  setTourUserIDs,
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview
};

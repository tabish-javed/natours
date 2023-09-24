import catchAsync from './../utils/catchAsync.js';
import Review from './../models/reviewModel.js';
import factory from './handlerFactory.js';


function setTourUserIDs (request, response, next) {
    // Allow nested routes
    if (!request.body.tour) request.body.tour = request.params.tourID;
    if (!request.body.user) request.body.user = request.user.id;
    next();
}


const getAllReviews = catchAsync(async function (request, response) {
    let filter = {};
    if (request.params.tourID) filter = { tour: request.params.tourID };

    const reviews = await Review.find(filter);

    response.status(200).json({
        status: 'success',
        results: reviews.length,
        data: reviews
    });
});

const createReview = factory.createOne(Review);
const updateReview = factory.updateOne(Review);
const deleteReview = factory.deleteOne(Review);

export default {
    setTourUserIDs,
    createReview,
    getAllReviews,
    updateReview,
    deleteReview
};

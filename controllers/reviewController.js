const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');


const createReview = catchAsync(async function (request, response) {
    // Allow nested routes
    if (!request.body.tour) request.body.tour = request.params.tourID;
    if (!request.body.user) request.body.user = request.user.id;

    const review = await Review.create(request.body);

    response.status(201).json({
        status: 'success',
        data: review
    });
});


const getAllReviews = catchAsync(async function (request, response) {
    const reviews = await Review.find()
        .populate({
            path: 'user',
            select: 'name photo'
        });

    response.status(200).json({
        status: 'success',
        results: reviews.length,
        data: reviews
    });
});

module.exports = {
    createReview: createReview,
    getAllReviews: getAllReviews
};
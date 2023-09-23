const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel');


const createReview = catchAsync(async function (request, response) {
    request.body.user = request.user._id;
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
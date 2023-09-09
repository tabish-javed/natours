/* eslint-disable no-unused-vars */
// INTERNAL
// CUSTOM
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

// CUSTOM MIDDLEWARE BELOW -----------------------------
/**
 * This middleware function modify query for fetching data when
 * request hits the route - '/top-5-cheap' then pass request to
 * getAllTours route.
 * @param {*} request
 * @param {*} response
 * @param {*} next
 */
function aliasTopTour (request, response, next) {
    request.query.limit = 5;
    request.query.sort = '-ratingsAverage,price';
    request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}
// CUSTOM MIDDLEWARE ABOVE -----------------------------


// get all tours
const getAllTours = catchAsync(async (request, response, next) => {
    const features = new APIFeatures(Tour.find(), request.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;

    // send response
    response.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    });
});


// get one tour ----
const getTour = catchAsync(async (request, response, next) => {
    // Tour.findOne({_id: request.params.id})
    const tour = await Tour.findById(request.params.id);

    if (!tour) {
        return next(new AppError(`No tour found with ID: ${request.params.id}`, 404));
    }

    response.status(200).json({
        status: 'success',
        results: tour.length,
        data: {
            tour: tour
        }
    });
});


// create tour ----
const createTour = catchAsync(async (request, response, next) => {
    // const newTour = new Tour({})
    // newTour.save()

    const newTour = await Tour.create(request.body);
    // JSON.stringify with these options return JSON text in human readable format.
    response.status(200).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});


// update tour ----
const updateTour = catchAsync(async (request, response, next) => {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true,
    });

    if (!tour) {
        return next(new AppError(`No tour found with ID: ${request.params.id}`, 404));
    }

    response.status(200).json({
        status: 'success',
        data: {
            tour: tour
        }
    });
});


// delete tour ----
const deleteTour = catchAsync(async (request, response, next) => {
    const tour = await Tour.findByIdAndDelete(request.params.id);

    if (!tour) {
        return next(new AppError(`No tour found with ID: ${request.params.id}`, 404));
    }

    response.status(204).json({
        status: 'success',
        data: {
            tour: null
        }
    });
});


// get statistics using aggregation pipeline
const getTourStats = catchAsync(async (request, response, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numRatings: { $sum: '$ratingsQuantity' },
                numTours: { $sum: 1 },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ]);

    response.status(200).json({
        status: 'success',
        data: {
            stats: stats
        }
    });
});


// get statistic using aggregation pipeline
const getMonthlyPlan = catchAsync(async (request, response, next) => {
    const year = +request.params.year;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    response.status(200).json({
        status: 'success',
        data: {
            plan: plan
        }
    });
});


// export all the functions
module.exports = {
    aliasTopTour: aliasTopTour,
    getAllTours: getAllTours,
    getTour: getTour,
    createTour: createTour,
    updateTour: updateTour,
    deleteTour: deleteTour,
    getTourStats: getTourStats,
    getMonthlyPlan: getMonthlyPlan
};
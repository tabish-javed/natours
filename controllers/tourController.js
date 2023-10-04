/* eslint-disable no-unused-vars */
import AppError from '../utils/appError.js';
import Tour from './../models/tourModel.js';
// import APIFeatures from './../utils/apiFeatures.js';
// import AppError from '../utils/appError.js';
import catchAsync from './../utils/catchAsync.js';
import factory from './handlerFactory.js';

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
const getAllTours = factory.getAll(Tour);
// get one tour ----
const getTour = factory.getOne(Tour, { path: 'reviews' });
// create tour ----
const createTour = factory.createOne(Tour);
// update tour ----
const updateTour = factory.updateOne(Tour);
// delete tour ----
const deleteTour = factory.deleteOne(Tour);


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


// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
const getToursWithin = catchAsync(async function (request, response, next) {
    const { distance, latlng, unit } = request.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError('Please provide latlng in the required format: lat,lng', 400));
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    response.status(200).json({
        status: 'success',
        results: tours.length,
        data: tours
    });
});


export default {
    aliasTopTour,
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
    getToursWithin
};
/* eslint-disable no-unused-vars */
import multer from 'multer';
import sharp from 'sharp';
import AppError from '../utils/appError.js';
import Tour from './../models/tourModel.js';
// import APIFeatures from './../utils/apiFeatures.js';
// import AppError from '../utils/appError.js';
import catchAsync from './../utils/catchAsync.js';
import factory from './handlerFactory.js';

// MULTER SETUP BELOW
// When saving image to memory buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, cb) => {
    if (file.mimetype.startsWith('image')) cb(null, true);
    else cb(new AppError('Not an image!, please upload only images.', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
// MULTER SETUP ABOVE

const uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

const resizeTourImages = catchAsync(async (request, response, next) => {

    if (!request.files.imageCover && !request.files.images) return next();

    // 1 - cover image
    if (request.files.imageCover) {
        request.body.imageCover = `tour-${request.params.id}-${Date.now()}-cover.jpeg`;
        await sharp(request.files.imageCover[0].buffer)
            .resize(2100, 1400)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${request.body.imageCover}`);
    }
    // 2 -images
    if (request.files.images) {
        request.body.images = [];
        await Promise.all(request.files.images.map(async (file, index) => {
            const fileName = `tour-${request.params.id}-${Date.now()}-${index + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2100, 1400)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${fileName}`);

            request.body.images.push(fileName);
        }));
    }
    next();
});

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


const getDistances = catchAsync(async function (request, response, next) {
    const { latlng, unit } = request.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.0006213712 : 0.001;

    if (!lat || !lng) {
        next(new AppError('Please provide latlng in the required format: lat,lng', 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [+lng, +lat]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1,
            }
        }
    ]);

    response.status(200).json({
        status: 'success',
        data: distances
    });
});


export default {
    aliasTopTour,
    getAllTours,
    getTour,
    createTour,
    updateTour,
    uploadTourImages,
    resizeTourImages,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances
};
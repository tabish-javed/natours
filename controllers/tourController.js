// INTERNAL
// CUSTOM
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

// MIDDLEWARE BELOW -----------------------------
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
// MIDDLEWARE ABOVE -----------------------------

// get all tours ----
async function getAllTours (request, response) {
    try {
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
    } catch (error) {
        response.status(404).json({
            status: 'failed',
            message: error
        });
    }
}

// get one tour ----
async function getTour (request, response) {
    try {
        const tour = await Tour.findById(request.params.id);
        // Tour.findOne({_id: request.params.id})
        response.status(200).json({
            status: 'success',
            results: tour.length,
            data: {
                tour: tour
            }
        });
    } catch (error) {
        response.status(404).json({
            status: 'failed',
            message: error
        });
    }
}

// create tour ----
async function createTour (request, response) {
    try {
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
    } catch (error) {
        response.status(400).json({
            status: 'failed',
            message: 'Invalid data sent!',
        });
        /* if (error.code === 11000 && error.name === 'MongoServerError') {
            response.status(400).json({
                status: 'failed',
                message: 'Duplicate Entry!',
                error: {
                    name: error.name,
                    error
                }
            });
        } else {
            response.status(400).json({
                status: 'failed',
                error
            });
        } */
    }
}

// update tour ----
async function updateTour (request, response) {
    try {
        const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            runValidators: true
        });
        response.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        });
    } catch (error) {
        response.status(404).json({
            status: 'failed',
            message: error
        });
    }

}

// delete tour ----
async function deleteTour (request, response) {
    try {
        await Tour.findByIdAndDelete(request.params.id);
        response.status(200).json({
            status: 'success',
            data: {
                tour: null
            }
        });
    } catch (error) {
        response.status(404).json({
            status: 'failed',
            message: error
        });
    }
}

async function getTourStats (request, response) {
    try {
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
    } catch (error) {
        response.status(404).json({
            status: 'failed',
            message: error
        });
    }
}

async function getMonthlyPlan (request, response) {
    try {
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
    } catch (error) {
        response.status(404).json({
            status: 'failed',
            message: error
        });
    }
}

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
// INTERNAL
// CUSTOM
const Tour = require('./../models/tourModel');


// MIDDLEWARE BELOW -----------------------------
// MIDDLEWARE ABOVE -----------------------------


// get all tours ----
async function getAllTours (request, response) {
    try {
        // build query
        // 1A - filtering
        const queryObject = { ...request.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(element => delete queryObject[element]);

        // 1B- advanced filtering
        let queryString = JSON.stringify(queryObject);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Tour.find(JSON.parse(queryString));

        // 2 - sorting
        if (request.query.sort) {
            const sortBy = request.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
            // sort("price ratingAverage")
        } else {
            query = query.sort('-createdAt');
        }

        // execute query
        const tours = await query;

        // const tours = Tour.find()
        //     .where('duration')
        //     .equals(5)
        //     .where('difficulty')
        //     .equals('easy');


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
        response.status(201).json({
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
        response.status(204).json({
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


module.exports = {
    getAllTours: getAllTours,
    getTour: getTour,
    createTour: createTour,
    updateTour: updateTour,
    deleteTour: deleteTour
};
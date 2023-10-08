import Tour from '../models/tourModel.js';
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


const getTour = catchAsync(async function (request, response) {
    // 1- get the data for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: request.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    // 2- build template


    // 3- render template using data from 1
    response.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour: tour
    });
});


export default {
    getOverview,
    getTour
};
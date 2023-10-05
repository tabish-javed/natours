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


function getTour (request, response) {
    // response.set("Content-Security-Policy", "default-src 'self'");
    response.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    });
}


export default {
    getOverview,
    getTour
};
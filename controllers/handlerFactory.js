import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';


// wrapper (decorator) function which return a closure = (function + local variables)
function deleteOne (Model) {
    return catchAsync(async (request, response, next) => {
        const document = await Model.findByIdAndDelete(request.params.id);

        if (!document) {
            return next(new AppError(`No document found with ID: ${request.params.id}`, 404));
        }

        response.status(204).json({
            status: 'success',
            data: null
        });
    });
};

function updateOne (Model) {
    return catchAsync(async (request, response, next) => {
        const document = await Model.findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            runValidators: true,
        });

        if (!document) {
            return next(new AppError(`No document found with ID: ${request.params.id}`, 404));
        }

        response.status(200).json({
            status: 'success',
            data: document
        });
    });
}


function createOne (Model) {
    return catchAsync(async (request, response) => {
        // const newTour = new Tour({})
        // newTour.save()

        const document = await Model.create(request.body);
        response.status(200).json({
            status: 'success',
            data: document
        });
    });
}


export default {
    deleteOne,
    updateOne,
    createOne
};
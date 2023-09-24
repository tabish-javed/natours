import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';


// wrapper (decorator) function which return a closure = (function + local variables)
const deleteOne = function (Model) {
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

export default { deleteOne };
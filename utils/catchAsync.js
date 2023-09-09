function catchAsync (fn) {
    return (request, response, next) => {
        fn(request, response, next).catch(error => next(error));
    };
};

module.exports = catchAsync;
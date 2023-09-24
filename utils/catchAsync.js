function catchAsync (fn) {
    return function (request, response, next) {
        fn(request, response, next).catch(error => next(error));
    };
};


export default catchAsync;
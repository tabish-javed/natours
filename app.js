// INTERNAL

// EXTERNAL
const express = require('express');
const morgan = require('morgan');
// CUSTOM
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');


const app = express();

// ALL BELOW SEPARATE ROUTES FOR GET, POST, PATCH AND DELETE ARE TURNED INTO APP.ROUTE
/*
// this is the primary request handler for get specific route
app.get('/api/v1/tours', getAllTours);

// this route handles request/url parameters such as; /api/v1/tours/7
app.get('/api/v1/tours/:id', getTour);

// this handler works for post requests
app.post('/api/v1/tours', createTour);

// this handler will update data - TODO - implement actual update instead of just a response
app.patch('/api/v1/tours/:id', updateTour);

// delete handler
app.delete('/api/v1/tours/:id', deleteTour);
 */
// ALL ABOVE SEPARATE ROUTES FOR GET, POST, PATCH AND DELETE ARE TURNED INTO APP.ROUTE

// third-party middleware to enable logging
app.use(morgan('dev'));

// express middleware  - to receive jason.parse()ed JS-Object from request's body (which is in JSON)
app.use(express.json());


// middleware 1 - custom
app.use((request, response, next) => {
    console.log(`${request.hostname}`);
    next();
});

// middleware 2 - custom
app.use((request, response, next) => {
    request.requestTime = new Date().toISOString();
    next();
});


// middleware to send request accordingly to desired router above
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// app startup
const port = 3000;
app.listen(port, () => {
    console.log(`App started on port ${port}`);
});
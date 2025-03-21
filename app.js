import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';

import AppError from './utils/appError.js';
import errorController from './controllers/errorController.js';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import viewRouter from './routes/viewRoutes.js';

dotenv.config({ path: './config.env' });

const app = express();

app.enable('trust proxy');

// creating "__dirname" variable (unavailable by default in ES6 module system)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// setting up pug as view engine (method path.join() inserts "/" between directory and file)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES ----

// global middleware - to enable, Cross Origin Resource Sharing.
app.use(cors());
// cors() returns a middleware which sets header = Access-Control-Allow-Origin to every request

// for example; if we have our API at api.natours.com and frontend at natours.com,
// then we allow natours.com to access API as in following code;
// ---- <- EXAMPLE ->
// app.use(cors({
//     origin: 'https://www.natours.com'
// }))
// ----

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors()) <- EXAMPLE

// global middleware - serves public static files
// app.use(express.static(`${__dirname}/public`));  <--- TO BE REMOVED
app.use(express.static(path.join(__dirname, 'public')));

// global middleware for setting up security HTTP headers
if (process.env.NODE_ENV === 'production') app.use(helmet());

// third-party middleware to enable logging (only in development environment)
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// global middleware - to limit number of request from specific IP
const rateLimitOptions = {
  max: 100,
  windowMs: 60 * 60 * 1_000,
  message: "Too many request from this IP, please try again in an hour!",
  validate: { trustProxy: false },
  // added "validate" property when "trust proxy" is enabled at LINE # 27
  // to skip error by rate limiter when "trust proxy" is used.
};
app.use('/api', rateLimit(rateLimitOptions));


// global middlewares
// - to receive jason.parse()ed JS - Object from request's body (which is in JSON);
app.use(express.json({ limit: '10kb' }));   // <- parses data from body
// - to receive data sent by client over URL in query string
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // <- parses data from URL
// - to receive data sent by client inside the cookie
app.use(cookieParser());    // <- parses data from cookie


// global middleware - data sanitization against NoSQL query injection
app.use(mongoSanitize());   // <- external library for data sanitization


// global middleware - data sanitization against XSS
app.use(xss());


// global middleware - prevent parameter pollution
app.use(hpp());


// global middleware - compression
app.use(compression());


// global test middleware - adding time to the request object
app.use((request, response, next) => {
  mongoose.sanitizeFilter(request.body);  // <-- mongoDB's internal method for data sanitization
  request.requestTime = new Date().toISOString();
  next();
});

// ROUTES

// middleware to send request accordingly to desired routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);


// bottom middleware 2 - custom (handling all other URLs)
app.all('*', function (request, response, next) {
  next(new AppError(`Can't find ${request.url} on this server!`, 404));
});


// error handling middleware
app.use(errorController.globalErrorHandler);

export default app;
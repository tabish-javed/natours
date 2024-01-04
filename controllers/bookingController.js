import Stripe from 'stripe';
import AppError from '../utils/appError.js';
import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import factory from './handlerFactory.js';


const getCheckoutSession = catchAsync(async (request, response, next) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // 1- Get the currently booked tour
    const tour = await Tour.findById(request.params.tourId);

    // 2- Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${request.protocol}://${request.get('host')}/?tour=${request.params.tourId}&user=${request.user.id}&price=${tour.price}`,
        cancel_url: `${request.protocol}://${request.get('host')}/tour/${tour.slug}`,
        customer_email: request.user.email,
        client_reference_id: request.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    }
                },
                quantity: 1
            }
        ],
        mode: 'payment'
    });

    // 3- Create session as response
    response.status(200).json({
        status: 'success',
        session: session
    });
});

const createBookingCheckout = catchAsync(async (request, response, next) => {
    // This is only TEMPORARY, because it's UNSECURE, everyone can make booking without paying
    const { tour, user, price } = request.query;

    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });

    response.redirect(request.originalUrl.split('?')[0]);
});


const createBooking = factory.createOne(Booking);
const getBooking = factory.getOne(Booking);
const getAllBooking = factory.getAll(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);

export default {
    getCheckoutSession,
    createBookingCheckout,
    createBooking,
    getBooking,
    getAllBooking,
    updateBooking,
    deleteBooking
};
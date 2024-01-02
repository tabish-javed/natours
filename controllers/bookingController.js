import Stripe from 'stripe';
import AppError from '../utils/appError.js';
import Tour from './../models/tourModel.js';
import catchAsync from './../utils/catchAsync.js';
import factory from './handlerFactory.js';


const getCheckoutSession = catchAsync(async (request, response, next) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // 1- Get the currently booked tour
    const tour = await Tour.findById(request.params.tourId);

    // 2- Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${request.protocol}://${request.get('host')}/`,
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

export default { getCheckoutSession };
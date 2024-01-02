import express from 'express';
import bookingController from '../controllers/bookingController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);


export default router;
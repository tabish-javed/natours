import express from 'express';
import authController from '../controllers/authController.js';
import bookingController from '../controllers/bookingController.js';
import viewController from '../controllers/viewController.js';

const router = express.Router();


router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

// this route support update user data without API call (default POST on form submit)
router.post('/submit-user-data', authController.protect, viewController.updateUserData);


export default router;
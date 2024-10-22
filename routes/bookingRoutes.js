import express from 'express';
import authController from '../controllers/authController.js';
import bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrict('admin', 'lead-guide'));

router.route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router.route('/"id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);


export default router;
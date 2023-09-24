import express from 'express';
import reviewController from '../controllers/reviewController.js';
import authController from '../controllers/authController.js';

// mergeParams option combines request which are sent by tourRouter
const router = express.Router({ mergeParams: true });

// POST /tour/278asd214/reviews
// POST /reviews

// request to any of the endpoints above will be handled here ----
// mergeParams above will combine "/" and /tour/278asd214/reviews to be handled in this route
router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.protect, authController.restrict('user'), reviewController.createReview);


router.route('/:id')
    .delete(reviewController.deleteReview);


export default router;
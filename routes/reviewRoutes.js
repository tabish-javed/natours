import express from 'express';
import reviewController from '../controllers/reviewController.js';
import authController from '../controllers/authController.js';

// mergeParams option combines request which are sent by tourRouter
const router = express.Router({ mergeParams: true });

// POST /tour/278asd214/reviews
// POST /reviews

// request to any of the endpoints above will be handled here ----
// mergeParams above will combine "/" and /tour/278asd214/reviews to be handled in this route

router.use(authController.protect);

router.route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrict('user'),
        reviewController.setTourUserIDs,
        reviewController.createReview
    );


router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrict('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrict('user', 'admin'), reviewController.deleteReview);


export default router;
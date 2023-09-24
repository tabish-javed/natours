import express from 'express';
import tourController from '../controllers/tourController.js';
import authController from '../controllers/authController.js';
import reviewRouter from '../routes/reviewRoutes.js';


const router = express.Router();

// POST /tour/278asd214/reviews
// GET /tour/2429sa2hd/reviews


// whenever request comes in this tourRoutes with params "/:tourID/reviews" then
// request will be passed to reviewRouter.
router.use('/:tourID/reviews', reviewRouter);

// middleware to check valid ID
// router.param('id', tourController.checkID);

// alias route (aliasTopTour - middleware) to send top 5 cheap tours
router.route('/top-5-cheap').get(tourController.aliasTopTour, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect,
        authController.restrict('admin', 'lead-guide'),
        tourController.deleteTour
    );

export default router;
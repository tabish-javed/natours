// INTERNAL
// EXTERNAL
const express = require('express');
// CUSTOM
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');


const router = express.Router();

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

module.exports = router;
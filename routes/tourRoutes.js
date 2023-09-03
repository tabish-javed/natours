// INTERNAL
// EXTERNAL
const express = require('express');
// CUSTOM
const tourController = require('./../controllers/tourController');


const router = express.Router();

// middleware to check valid ID
// router.param('id', tourController.checkID);

router.route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;
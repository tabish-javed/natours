import express from 'express';
import viewController from '../controllers/viewController.js';

const router = express.Router();

router.use(function (request, response, next) {
    const fontsURL = 'https://fonts.googleapis.com https://fonts.gstatic.com';
    response.setHeader("Content-Security-Policy", `default-src 'self' ${fontsURL}`);
    next();
});

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);


export default router;
import express from 'express';
import viewController from '../controllers/viewController.js';

const router = express.Router();

router.use(function (request, response, next) {
    response.set("Content-Security-Policy", "default-src 'self'");
    next();
});

router.get('/', viewController.getOverview);
router.get('/tour', viewController.getTour);


export default router;
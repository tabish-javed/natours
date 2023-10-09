import express from 'express';
import viewController from '../controllers/viewController.js';

const router = express.Router();


router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);


export default router;
import express from 'express';
import viewController from '../controllers/viewController.js';
import authController from '../controllers/authController.js';

const router = express.Router();


router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);


export default router;
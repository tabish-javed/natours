import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';


const router = express.Router();


router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);


router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updatePassword', authController.protect, authController.updatePassword);

router.get('/me', authController.protect, userController.getMe, userController.getUser);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deactivateMe);


router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);


export default router;
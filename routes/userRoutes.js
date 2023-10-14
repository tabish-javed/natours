import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';


const router = express.Router();


router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);
router.get('/logout', authController.logOut);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// verify authentication using "protect" for all the endpoints after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deactivateMe);


// all routes after this middleware can only be performed by "admin".
router.use(authController.restrict('admin'));

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);


export default router;
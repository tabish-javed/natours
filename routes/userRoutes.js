// INTERNAL
// EXTERNAL
const express = require('express');
// CUSTOM
const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');


const router = express.Router();


router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);


router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
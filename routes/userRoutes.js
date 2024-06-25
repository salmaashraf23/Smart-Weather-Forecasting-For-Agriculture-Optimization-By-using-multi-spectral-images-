const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const farmController = require('../controllers/farmController');
// const farmRouter = require('./farmRoutes');

const router = express.Router();

router
  .route('/:userId/my/farms')
  .post(
    authController.protect,
    farmController.setUserId,
    farmController.createFarms,
  )
  .get(authController.protect, farmController.getUserFarms);
// router.use('/:userId/my/farms', farmRouter);

router.post('/contact', authController.contactUs);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/confirmEmail', authController.confirmEmail);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/verify/:token', authController.verifyEmail);
router.get('/', userController.getAllUsers);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .post(userController.createUser)
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

//

module.exports = router;

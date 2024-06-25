const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const farmController = require('../controllers/farmController');

const router = express.Router();

router.get('/Home', authController.isLoggedIn, viewsController.getOverview);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/logout', authController.logout, viewsController.getOverview);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/forgotPassword', viewsController.getForgetPasswordForm);
router.get('/resetPassword/:token', viewsController.getResetPasswordForm);
router.get(
  '/create-Farm',
  authController.isLoggedIn,
  viewsController.getFarmCreation,
);
router.get(
  '/verify/:token',
  authController.isLoggedIn,
  viewsController.getOverview,
);
router.get('/dashboard', authController.protect, viewsController.getDashboard);
router.get('/dashboard/me', authController.protect, viewsController.getMe);
router.get(
  '/dashboard/:id/my-farms',
  authController.protect,
  viewsController.getMyFarms,
);
router.get(
  '/dashboard/users',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getUsers,
);
router.get(
  '/dashboard/farms',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getFarms,
);

router.get(
  '/dashboard/user/:id',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getUserAndUpdate,
);

module.exports = router;

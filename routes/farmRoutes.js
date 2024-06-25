const express = require('express');
const farmController = require('../controllers/farmController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/').get(farmController.getAllFarms);

router
  .route('/:id')
  .get(authController.restrictTo('admin'), farmController.getFarm)
  .delete(farmController.deleteFarm);

module.exports = router;

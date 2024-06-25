const User = require('../models/userModel');
const Farm = require('../models/farmModel');
const catchAsync = require('../utils/catchAsync');
const { getUsers } = require('../public/js/users');
const { getMyFarms } = require('../public/js/myFarms');
const { getfarms } = require('../public/js/farms');

exports.getOverview = catchAsync(async (req, res, next) => {
  // ) Build template
  // ) Render that template using tour data from 1)
  res.status(200).render('homeView', {
    title: 'Smart weather forcasting for agriculture optimization',
  });
});

exports.getFarmCreation = (req, res) => {
  res.status(200).render('createFarm', {
    title: 'Create Farm',
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign Up',
  });
};

exports.getForgetPasswordForm = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot Password',
  });
};

exports.getResetPasswordForm = (req, res) => {
  res.status(200).render('resetPassword', {
    title: 'Reset My Password',
  });
};

exports.getDashboard = (req, res) => {
  res.status(200).render('dashboard', {
    title: 'Dashboard',
  });
};

exports.getMe = (req, res) => {
  res.status(200).render('Dashme', {
    title: 'Profile',
  });
};

exports.getMyFarms = catchAsync(async (req, res, next) => {
  // Get the user ID from the request parameters
  const userId = req.params.id;

  // Get the page number from the request query or default to 1
  const pageNumber = req.query.page || 1;

  // Get JWT token from cookies or headers
  const token = req.cookies.jwt; // Assuming you are storing JWT token in cookies

  // Call getMyFarms function to fetch farms data for the specified page number and user ID
  const { farms, totalPages } = await getMyFarms(pageNumber, userId, token);

  res.status(200).render('myfarms', {
    title: 'My Farms',
    farms: farms,
    totalPages: totalPages,
    currentPage: parseInt(pageNumber, 10),
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  // Get the page number from the request query or default to 1
  const pageNumber = req.query.page || 1;

  // Call getUsers function to fetch users data for the specified page number
  const { users, totalPages } = await getUsers(pageNumber);

  // Build template and render it
  res.status(200).render('users', {
    title: 'all users',
    users: users,
    totalPages: totalPages,
    currentPage: parseInt(pageNumber, 10),
  });
});

exports.getFarms = async (req, res, next) => {
  try {
    const pageNumber = req.query.page || 1;
    const token = req.cookies.jwt; // Example: retrieve token from cookies

    const { farms, totalPages } = await getfarms(pageNumber, token);

    if (!farms || !totalPages) {
      throw new Error('Failed to fetch farms data');
    }

    res.status(200).render('farms', {
      title: 'All Farms',
      farms: farms,
      totalPages: totalPages,
      currentPage: parseInt(pageNumber, 10),
      // user: req.user // Assuming user information is passed from middleware
    });
  } catch (err) {
    console.error('Error fetching farms:', err);
    res.status(500).send('Failed to fetch farms');
  }
};

exports.getUserAndUpdate = catchAsync(async (req, res, next) => {
  // 1) Get user data from collection
  const user = await User.findByIdAndUpdate(req.params.id);

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('updateUser', {
    title: 'update user',
    user,
  });
});

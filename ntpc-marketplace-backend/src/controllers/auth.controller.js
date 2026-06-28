const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const createdUser = await authService.registerUser(req.body);

    return res.status(201).json({
      message: 'User registered successfully',
      data: createdUser,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const currentUser = await authService.getCurrentUser(req.user.user_id);

    return res.status(200).json(currentUser);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  me,
};

const authService = require('./auth.service');
const { sendResponse } = require('../../utils/responseHelper');
const { registerSchema, loginSchema, resetPasswordSchema } = require('./validations/auth.validation');

exports.register = (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return sendResponse(res, 400, error.details[0].message);
  }

  authService.register(value)
    .then(result => {
      sendResponse(res, 201, "User registered successfully", result);
    })
    .catch(error => {
      sendResponse(res, 500, error.message);
    });
};

exports.login = (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return sendResponse(res, 400, error.details[0].message);
  }

  authService.login(value)
    .then(result => {
      sendResponse(res, 200, "User logged in successfully", result);
    })
    .catch(error => {
      sendResponse(res, 401, error.message);
    });
};

exports.forgotPassword = (req, res) => {
  authService.forgotPassword(req.body)
    .then(result => {
      sendResponse(res, 200, "Email exits. Proceed to reset", result);
    })
    .catch(error => {
      sendResponse(res, 500, error.message);
    });
};

exports.resetPassword = (req, res) => {
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) {
    return sendResponse(res, 400, error.details[0].message);
  }

  authService.resetPassword(value)
    .then(result => {
      sendResponse(res, 200, "Password reset successful. Redirecting to login page", result);
    })
    .catch(error => {
      sendResponse(res, 400, error.message);
    });
};

exports.getProfile = (req, res) => {
  authService.getProfile(req.userId)
    .then(result => {
      sendResponse(res, 200, "User profile retrieved successfully", result);
    })
    .catch(error => {
      sendResponse(res, 500, error.message);
    });
};

const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().normalize().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/\d/)
    .pattern(/[a-zA-Z]/)
    .pattern(/[!@#$%^&*(),.?":{}|<>]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Invalid phone number',
    'any.required': 'Phone number is required',
  }),
  dob: Joi.date().iso().required().messages({
    'date.base': 'Invalid date of birth',
    'any.required': 'Date of birth is required',
  }),
  gender: Joi.string()
  .valid('Male', 'Female')
  .required()
  .messages({
    'string.valid': 'Gender must be either Male or Female',
    'any.required': 'Gender is required',
  }),
  
});

// Login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().normalize().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Password reset schema
const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().normalize().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/\d/)
    .pattern(/[a-zA-Z]/)
    .pattern(/[!@#$%^&*(),.?":{}|<>]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password does not match new password',
      'any.required': 'Confirm password is required',
    }),
}).unknown(true);

module.exports = { registerSchema, loginSchema, resetPasswordSchema };


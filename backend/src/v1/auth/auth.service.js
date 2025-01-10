const db = require('../../../config/knex');
const { hashPassword, comparePassword, generateToken } = require('./auth.utils');
const fs = require('fs');


// Register user
exports.register = async ({ username, email, password, phoneNumber, gender, dob }) => {
  const hashedPassword = await hashPassword(password);
  await db('users').insert({ username, email, password: hashedPassword, phoneNumber, gender, dob });
  return { message: 'User registered successfully' };
};

// Login user
exports.login = async ({ email, password }) => {
  const user = await db('users').where({ email }).first();
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken({ userId: user.id }, process.env.JWT_SECRET);
  return { message: 'Login successful', token };
};

// Get user profile
exports.getProfile = async (userId) => {
  const user = await db('users').where({ id: userId }).select('id', 'username', 'email', 'gender', 'dob').first();
  if (!user) throw new Error('User not found');

  return { message: 'User profile retrieved successfully', user };
};

// Update user profile
exports.updateProfile = async (userId, updatedData) => {
  const { username, email, phoneNumber, gender, dob, password } = updatedData;

  const updatePayload = { username, email, phoneNumber, gender, dob };
  if (password) {
    updatePayload.password = await hashPassword(password);
  }

  const result = await db('users').where({ id: userId }).update(updatePayload);
  if (!result) throw new Error('Failed to update user profile');

  return { message: 'User profile updated successfully' };
};

// Forgot password
exports.forgotPassword = async ({ email }) => {
  const user = await db('users').where({ email }).first();
  if (!user) throw new Error('User with this email does not exist');

  return { message: 'Email exists, please provide new password' };
};

// Reset password
exports.resetPassword = async ({ email, newPassword }) => {
  const user = await db('users').where({ email }).first();
  if (!user) throw new Error('User not found');

  const isMatch = await comparePassword(newPassword, user.password);
  if (isMatch) throw new Error('New password cannot be the same as the old password');

  const hashedPassword = await hashPassword(newPassword);
  await db('users').where({ email }).update({ password: hashedPassword });

  return { message: 'Password updated successfully' };
};
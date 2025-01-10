const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - The hashed password.
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password.
 * @param {string} hashedPassword - The hashed password.
 * @returns {Promise<boolean>} - Whether the passwords match.
 */
exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generates a JWT token.
 * @param {object} payload - The payload to encode in the token.
 * @param {string} secret - The JWT secret key.
 * @param {object} options - Additional options (e.g., expiration time).
 * @returns {string} - The signed JWT token.
 */
exports.generateToken = (payload, secret, options = { expiresIn: '1h' }) => {
  return jwt.sign(payload, secret, options);
};

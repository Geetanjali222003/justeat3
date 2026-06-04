/*
  tokenUtils.js
  - Utility functions for working with JWT tokens on the client side.
  - WARNING: These functions do NOT verify token signatures. They only decode
    and check expiration. All security validations happen on the server.
*/

/**
 * Decode a JWT token payload (no verification — client-side only).
 * Extracts and parses the payload section of a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object|null} Decoded payload object or null if parsing fails
 */
export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

/**
 * Check whether a JWT token is expired based on the 'exp' claim.
 * @param {string} token - JWT token string
 * @returns {boolean} true if expired or invalid, false if still valid
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  // JWT exp is in seconds; Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
};

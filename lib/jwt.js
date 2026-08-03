import jwt from "jsonwebtoken";

/**
 * Retrieves the application's JWT_SECRET from environment variables.
 * Throws an explicit error if missing to prevent fallback secret token forgery.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing.");
  }
  return secret;
}

/**
 * Signs a JWT payload using the central JWT secret.
 */
export function signToken(payload, options = {}) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, options);
}

/**
 * Verifies a JWT token using the central JWT secret.
 */
export function verifyToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}

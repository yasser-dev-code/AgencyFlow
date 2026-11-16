import { env } from '../config/env.js';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/http.js';

// Verifies the JWT stored in the HTTP-only cookie and attaches the user.
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[env.cookieName];
  if (!token) {
    throw new ApiError(401, 'Authentication required.');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Session is invalid or has expired.');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!user) {
    throw new ApiError(401, 'Account no longer exists.');
  }

  req.user = user;
  next();
});

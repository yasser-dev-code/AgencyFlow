import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, sendSuccess } from '../utils/http.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

const PUBLIC_USER = { id: true, name: true, email: true, role: true };

function setSessionCookie(res, token) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: 8 * 60 * 60 * 1000
  });
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken({ sub: user.id, role: user.role });
  setSessionCookie(res, token);

  const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  return sendSuccess(res, { data: { user: publicUser } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.cookieName);
  return sendSuccess(res, { message: 'Logged out.' });
});

export const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { data: { user: req.user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new ApiError(400, 'Current password is incorrect.');
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return sendSuccess(res, { message: 'Password updated.' });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name: req.body.name },
    select: PUBLIC_USER
  });
  return sendSuccess(res, { data: { user } });
});

import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';

// Centralized error handler. Always returns the same JSON envelope and never
// leaks stack traces or internal details to the client.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {})
    });
  }

  // Prisma known request errors -> friendly HTTP responses.
  switch (err?.code) {
    case 'P2002':
      return res.status(409).json({ success: false, message: 'A record with this value already exists.' });
    case 'P2003':
      return res.status(400).json({ success: false, message: 'A related record does not exist.' });
    case 'P2025':
      return res.status(404).json({ success: false, message: 'Record not found.' });
    default:
      break;
  }

  const status = Number.isInteger(err?.status) ? err.status : 500;
  if (status >= 500) console.error('Unhandled error:', err);

  return res.status(status).json({
    success: false,
    message: status >= 500 && env.isProduction ? 'Internal server error.' : err?.message || 'Internal server error.'
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

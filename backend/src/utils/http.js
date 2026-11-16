// Small helpers for a consistent JSON response envelope.
export function sendSuccess(res, { status = 200, data = null, message } = {}) {
  return res.status(status).json({ success: true, message, data });
}

export function sendCreated(res, data) {
  return sendSuccess(res, { status: 201, data });
}

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

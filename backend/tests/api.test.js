import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /api/health', () => {
  it('responds with ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: 'ok' } });
  });
});

describe('protected routes without a session', () => {
  it('rejects unauthenticated access to stats', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('unknown routes', () => {
  it('returns a 404 envelope', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

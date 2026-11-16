import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/utils/password.js';
import { signToken, verifyToken } from '../src/utils/jwt.js';

describe('password utils', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hash = await hashPassword('supersecret123');
    expect(hash).not.toBe('supersecret123');
    expect(await comparePassword('supersecret123', hash)).toBe(true);
    expect(await comparePassword('wrongpassword', hash)).toBe(false);
  });
});

describe('jwt utils', () => {
  it('signs and verifies a token round-trip', () => {
    const token = signToken({ sub: 'user-1', role: 'ADMIN' });
    const payload = verifyToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('ADMIN');
  });
});

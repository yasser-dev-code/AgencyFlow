import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { hashPassword } from '../../src/utils/password.js';

const testUrl = process.env.DATABASE_URL;

const ADMIN = { email: 'admin@test.local', password: 'AdminPass123!' };
const EMP = { email: 'employee@test.local', password: 'EmpPass123!' };

let adminAgent;
let empAgent;
let empId;

async function wipe() {
  await prisma.task.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
}

beforeAll(async () => {
  // Hard guard: never run these tests against anything but the dedicated test DB.
  if (!testUrl || !testUrl.includes('agencyflow_test')) {
    throw new Error('Integration tests require DATABASE_URL to point at "agencyflow_test". Aborting to protect data.');
  }

  await wipe();
  await prisma.user.create({
    data: { name: 'Admin', email: ADMIN.email, passwordHash: await hashPassword(ADMIN.password), role: 'ADMIN' }
  });
  const emp = await prisma.user.create({
    data: { name: 'Employee', email: EMP.email, passwordHash: await hashPassword(EMP.password), role: 'EMPLOYEE' }
  });
  empId = emp.id;

  adminAgent = request.agent(app);
  await adminAgent.post('/api/auth/login').send(ADMIN);
  empAgent = request.agent(app);
  await empAgent.post('/api/auth/login').send(EMP);
});

afterAll(async () => {
  await wipe();
  await prisma.$disconnect();
});

describe('authentication', () => {
  it('rejects a wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: 'nope' });
    expect(res.status).toBe(401);
  });

  it('logs in and never exposes the password hash', async () => {
    const res = await request(app).post('/api/auth/login').send(ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeTruthy();
  });

  it('requires a session for protected routes', async () => {
    const res = await request(app).get('/api/clients');
    expect(res.status).toBe(401);
  });
});

describe('role-based authorization', () => {
  it('blocks EMPLOYEE from the admin-only employees endpoint', async () => {
    const res = await empAgent.get('/api/employees');
    expect(res.status).toBe(403);
  });

  it('blocks EMPLOYEE from creating clients', async () => {
    const res = await empAgent.post('/api/clients').send({ name: 'Sneaky Client' });
    expect(res.status).toBe(403);
  });

  it('allows EMPLOYEE to read clients', async () => {
    const res = await empAgent.get('/api/clients');
    expect(res.status).toBe(200);
  });

  it('allows ADMIN to reach the employees endpoint', async () => {
    const res = await adminAgent.get('/api/employees');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('client CRUD + validation', () => {
  let clientId;

  it('creates a client (admin)', async () => {
    const res = await adminAgent.post('/api/clients').send({ name: 'Acme Corp', company: 'Acme', status: 'ACTIVE' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Acme Corp');
    clientId = res.body.data.id;
  });

  it('rejects an invalid client payload with 400', async () => {
    const res = await adminAgent.post('/api/clients').send({ name: 'A' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('lists and searches clients', async () => {
    const all = await adminAgent.get('/api/clients');
    expect(all.status).toBe(200);
    expect(all.body.data.some((c) => c.id === clientId)).toBe(true);

    const searched = await adminAgent.get('/api/clients').query({ search: 'Acme' });
    expect(searched.body.data.length).toBeGreaterThan(0);
  });

  it('updates and deletes a client', async () => {
    const upd = await adminAgent.put(`/api/clients/${clientId}`).send({ status: 'INACTIVE' });
    expect(upd.status).toBe(200);
    expect(upd.body.data.status).toBe('INACTIVE');

    const del = await adminAgent.delete(`/api/clients/${clientId}`);
    expect(del.status).toBe(200);

    const missing = await adminAgent.get(`/api/clients/${clientId}`);
    expect(missing.status).toBe(404);
  });
});

describe('task scoping and employee permissions', () => {
  let taskId;

  it('admin assigns a task to the employee', async () => {
    const res = await adminAgent
      .post('/api/tasks')
      .send({ title: 'Write copy', priority: 'HIGH', assignedToId: empId });
    expect(res.status).toBe(201);
    taskId = res.body.data.id;
  });

  it('employee sees only their own tasks', async () => {
    const res = await empAgent.get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data.every((t) => t.assignedTo?.id === empId || t.assignedToId === empId)).toBe(true);
    expect(res.body.data.some((t) => t.id === taskId)).toBe(true);
  });

  it('employee can update the status of their own task', async () => {
    const res = await empAgent.put(`/api/tasks/${taskId}`).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('employee cannot edit other task fields', async () => {
    const res = await empAgent.put(`/api/tasks/${taskId}`).send({ title: 'Hacked title' });
    expect(res.status).toBe(403);
  });

  it('employee cannot delete tasks', async () => {
    const res = await empAgent.delete(`/api/tasks/${taskId}`);
    expect(res.status).toBe(403);
  });
});

describe('stats reflect real data', () => {
  it('returns database-backed totals', async () => {
    const res = await adminAgent.get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totals.employees).toBe(2);
    expect(typeof res.body.data.totals.overdueTasks).toBe('number');
    expect(Array.isArray(res.body.data.recentTasks)).toBe(true);
  });
});

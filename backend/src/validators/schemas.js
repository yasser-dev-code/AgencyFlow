import { z } from 'zod';

const password = z.string().min(8, 'Password must be at least 8 characters.');
const email = z.string().email('Invalid email address.').toLowerCase();

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: password
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional()
});

const clientStatus = z.enum(['LEAD', 'ACTIVE', 'INACTIVE']);

export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(120),
  company: z.string().max(120).optional().or(z.literal('')),
  email: email.optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  status: clientStatus.optional()
});

export const updateClientSchema = createClientSchema.partial();

const campaignStatus = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']);
const dateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date.');

export const createCampaignSchema = z
  .object({
    name: z.string().min(2).max(140),
    platform: z.string().min(2).max(60),
    budget: z.coerce.number().nonnegative().optional(),
    startDate: dateString,
    endDate: dateString,
    status: campaignStatus.optional(),
    clientId: z.string().min(1, 'Client is required.')
  })
  .refine((data) => Date.parse(data.endDate) >= Date.parse(data.startDate), {
    message: 'End date must be on or after the start date.',
    path: ['endDate']
  });

export const updateCampaignSchema = z
  .object({
    name: z.string().min(2).max(140).optional(),
    platform: z.string().min(2).max(60).optional(),
    budget: z.coerce.number().nonnegative().optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    status: campaignStatus.optional(),
    clientId: z.string().min(1).optional()
  })
  .partial();

const taskStatus = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']);
const taskPriority = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTaskSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional().or(z.literal('')),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  dueDate: dateString.optional().or(z.literal('')),
  assignedToId: z.string().optional().or(z.literal('')),
  campaignId: z.string().optional().or(z.literal(''))
});

export const updateTaskSchema = createTaskSchema.partial();

export const createEmployeeSchema = z.object({
  name: z.string().min(2).max(80),
  email,
  password,
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional()
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: email.optional(),
  password: password.optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional()
});

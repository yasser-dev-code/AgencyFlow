import { PrismaClient } from '@prisma/client';

// A single shared Prisma client for the whole backend process.
export const prisma = new PrismaClient();

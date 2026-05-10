import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client.js';

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, '');
}

const connectionString = cleanEnvValue(process.env.DATABASE_URL) ?? '';

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

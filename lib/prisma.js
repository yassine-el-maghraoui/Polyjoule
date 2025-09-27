import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

if (process.env.DATABASE_URL?.startsWith('file:./')) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, '..');
  const relativePart = process.env.DATABASE_URL.replace('file:./', '');
  const absolutePath = path.resolve(projectRoot, relativePart);
  process.env.DATABASE_URL = `file:${absolutePath}`;
}

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

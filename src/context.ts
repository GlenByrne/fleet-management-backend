import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  req: any;
}

export function context(req: any) {
  return {
    ...req,
    prisma,
  };
}

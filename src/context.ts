import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { PubSub } from 'graphql-subscriptions';

export interface Context {
  prisma: PrismaClient;
  pubSub: PubSub;
  req: Request;
  res: Response;
}

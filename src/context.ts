import { FuelCard, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PubSub } from 'graphql-subscriptions';
import { TypedPubSub } from 'typed-graphql-subscriptions';

const prisma = new PrismaClient();

// export type PubSubChannels = {
//   newCard: [{ createdCard: FuelCard }];
// };

// const pubSub = new TypedPubSub<PubSubChannels>(new PubSub());

export const pubSub = new PubSub();

export interface Context {
  prisma: PrismaClient;
  pubSub: PubSub;
  req: Request;
  res: Response;
}

export async function contextFactory(req: Request, res: Response) {
  return {
    prisma,
    pubSub,
    req,
    res,
  };
}

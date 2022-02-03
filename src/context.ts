import { FuelCard, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PubSub } from 'graphql-subscriptions';
import { TypedPubSub } from 'typed-graphql-subscriptions';

const prisma = new PrismaClient();

export type PubSubChannels = {
  newCard: [{ createdCard: FuelCard }];
};

const pubSub = new TypedPubSub<PubSubChannels>(new PubSub());

export interface Context {
  prisma: PrismaClient;
  req: Request;
  res: Response;
  pubsSub: typeof pubSub;
}

export async function contextFactory(req: Request, res: Response) {
  return {
    prisma,
    req,
    res,
    pubSub,
  };
}

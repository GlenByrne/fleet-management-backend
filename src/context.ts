import { FuelCard, PrismaClient } from '@prisma/client';
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
  req: FastifyRequest;
  res: FastifyReply;
  pubsSub: typeof pubSub;
}

export async function contextFactory(req: FastifyRequest, res: FastifyReply) {
  return {
    prisma,
    req,
    res,
    pubSub,
  };
}

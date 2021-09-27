import {
  objectType,
  idArg,
  nonNull,
  inputObjectType,
  arg,
  extendType,
} from 'nexus';
import { Context } from '../context';
import { Vehicle } from './Vehicle';

export const Depot = objectType({
  name: 'Depot',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.list.nonNull.field('vehicles', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.depot
          .findUnique({
            where: { id: parent.id },
          })
          .vehicles();
      },
    });
  },
});

export const DepotQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('depots', {
      type: Depot,
      resolve: (_, __, context: Context) => context.prisma.depot.findMany(),
    });
    t.list.field('vehiclesInDepot', {
      type: Vehicle,
      args: {
        depotId: nonNull(idArg()),
      },
      resolve: (_, { depotId }, context: Context) =>
        context.prisma.depot
          .findUnique({
            where: {
              id: depotId,
            },
          })
          .vehicles(),
    });
  },
});

const AddDepotInput = inputObjectType({
  name: 'AddDepotInput',
  definition(t) {
    t.nonNull.string('name');
  },
});

export const DepotMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addDepot', {
      type: Depot,
      args: {
        data: nonNull(
          arg({
            type: AddDepotInput,
          })
        ),
      },
      resolve: (_, args, context: Context) =>
        context.prisma.depot.create({
          data: {
            name: args.data.name,
          },
        }),
    });
  },
});

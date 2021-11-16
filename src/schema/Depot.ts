import {
  objectType,
  idArg,
  nonNull,
  inputObjectType,
  arg,
  extendType,
} from 'nexus';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
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

const DepotInputFilter = inputObjectType({
  name: 'DepotInputFilter',
  definition(t) {
    t.string('searchCriteria');
  },
});

export const DepotQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('depots', {
      type: Depot,
      args: {
        data: arg({
          type: DepotInputFilter,
        }),
      },
      resolve: async (_, args, context: Context) => {
        try {
          const userId = getUserId(context);

          if (!userId) {
            throw new Error(
              'Unable to retrieve depots. You are not logged in.'
            );
          }

          return context.prisma.depot.findMany({
            where: {
              name: {
                contains:
                  args.data?.searchCriteria != null
                    ? args.data.searchCriteria
                    : undefined,
                mode: 'insensitive',
              },
            },
            orderBy: {
              name: 'asc',
            },
          });
        } catch (error) {
          throw new Error('Error retrieving depots');
        }
      },
    });

    t.list.field('vehiclesInDepot', {
      type: Vehicle,
      args: {
        depotId: nonNull(idArg()),
      },
      resolve: (_, { depotId }, context: Context) => {
        try {
          return context.prisma.depot
            .findUnique({
              where: {
                id: depotId,
              },
            })
            .vehicles();
        } catch (error) {
          throw new Error('Error retrieving vehicles for depot');
        }
      },
    });
  },
});

const AddDepotInput = inputObjectType({
  name: 'AddDepotInput',
  definition(t) {
    t.nonNull.string('name');
  },
});

const UpdateDepotInput = inputObjectType({
  name: 'UpdateDepotInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
  },
});

const DeleteDepotInput = inputObjectType({
  name: 'DeleteDepotInput',
  definition(t) {
    t.nonNull.id('id');
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
      resolve: async (_, args, context: Context) => {
        try {
          const userId = getUserId(context);

          if (!userId) {
            throw new Error('Unable to add depot. You are not logged in.');
          }

          const existingDepot = await context.prisma.depot.findUnique({
            where: {
              name: args.data.name,
            },
          });

          if (existingDepot) {
            throw new Error('Depot already exists with this name');
          }

          return context.prisma.depot.create({
            data: {
              name: args.data.name,
            },
          });
        } catch (error) {
          throw new Error('Error adding depot');
        }
      },
    });

    t.nonNull.field('updateDepot', {
      type: Depot,
      args: {
        data: nonNull(
          arg({
            type: UpdateDepotInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          return context.prisma.depot.update({
            where: {
              id: args.data.id,
            },
            data: {
              name: args.data.name,
            },
          });
        } catch (error) {
          throw new Error('Error updating depot');
        }
      },
    });

    t.nonNull.field('deleteDepot', {
      type: Depot,
      args: {
        data: nonNull(
          arg({
            type: DeleteDepotInput,
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.depot.delete({
            where: {
              id: args.data.id,
            },
          });
        } catch (error) {
          throw new Error('Error deleting depot');
        }
      },
    });
  },
});

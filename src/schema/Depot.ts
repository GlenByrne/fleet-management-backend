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
import { Company } from './Company';
import { FuelCard } from './FuelCard';
import { TollTag } from './TollTag';
import { Vehicle } from './Vehicle';

export const Depot = objectType({
  name: 'Depot',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.field('company', {
      type: Company,
      resolve: async (parent, _, context: Context) => {
        const company = await context.prisma.depot
          .findUnique({
            where: { id: parent.id },
          })
          .company();

        if (!company) {
          throw new Error('Company not found');
        }

        return company;
      },
    });
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
    t.nonNull.list.nonNull.field('fuelCards', {
      type: FuelCard,
      resolve(parent, _, context: Context) {
        return context.prisma.depot
          .findUnique({
            where: { id: parent.id },
          })
          .fuelCards();
      },
    });
    t.nonNull.list.nonNull.field('tollTags', {
      type: TollTag,
      resolve(parent, _, context: Context) {
        return context.prisma.depot
          .findUnique({
            where: { id: parent.id },
          })
          .tollTags();
      },
    });
  },
});

export const DepotQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('depots', {
      type: Depot,
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();
        return context.prisma.depot.findMany({
          where: {
            companyId: company?.id,
          },
          orderBy: {
            name: 'asc',
          },
        });
      },
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
        const userId = getUserId(context);

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.depot.create({
          data: {
            name: args.data.name,
            company: {
              connect: {
                id: company?.id,
              },
            },
          },
        });
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
      resolve: async (_, args, context: Context) =>
        context.prisma.depot.update({
          where: {
            id: args.data.id,
          },
          data: {
            name: args.data.name,
          },
        }),
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
      resolve: (_, args, context: Context) =>
        context.prisma.depot.delete({
          where: {
            id: args.data.id,
          },
        }),
    });
  },
});

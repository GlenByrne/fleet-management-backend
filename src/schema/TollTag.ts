import { objectType, nonNull, arg, inputObjectType, extendType } from 'nexus';
import { Context } from '../context';
import createConnection from '../utilities/createConnection';
import { getUserId } from '../utilities/getUserId';
import upsertConnection from '../utilities/upsertConnection';
import { Company } from './Company';
import { Depot } from './Depot';
import { Vehicle } from './Vehicle';

export const TollTag = objectType({
  name: 'TollTag',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
    t.nonNull.field('company', {
      type: Company,
      resolve: async (parent, _, context: Context) => {
        const company = await context.prisma.tollTag
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
    t.field('vehicle', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.tollTag
          .findUnique({
            where: { id: parent.id },
          })
          .vehicle();
      },
    });
    t.field('depot', {
      type: Depot,
      resolve(parent, _, context: Context) {
        return context.prisma.tollTag
          .findUnique({
            where: { id: parent.id },
          })
          .depot();
      },
    });
  },
});

export const TollTagQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('tollTags', {
      type: TollTag,
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.tollTag.findMany({
          where: {
            companyId: company?.id,
          },
          orderBy: {
            tagNumber: 'asc',
          },
        });
      },
    });

    t.list.field('tollTagsNotAssigned', {
      type: TollTag,
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.tollTag.findMany({
          where: {
            AND: [{ vehicleId: null }, { companyId: company?.id }],
          },
        });
      },
    });
  },
});

const AddTollTagInput = inputObjectType({
  name: 'AddTollTagInput',
  definition(t) {
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
    t.string('depotId');
  },
});

const UpdateTollTagInput = inputObjectType({
  name: 'UpdateTollTagInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
    t.string('depotId');
  },
});

const DeleteTollTagInput = inputObjectType({
  name: 'DeleteTollTagInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const TollTagMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addTollTag', {
      type: TollTag,
      args: {
        data: nonNull(
          arg({
            type: AddTollTagInput,
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

        return context.prisma.tollTag.create({
          data: {
            tagNumber: args.data.tagNumber,
            tagProvider: args.data.tagProvider,
            company: {
              connect: {
                id: company?.id,
              },
            },
            ...createConnection('depot', args.data.depotId),
          },
        });
      },
    });

    t.nonNull.field('updateTollTag', {
      type: TollTag,
      args: {
        data: nonNull(
          arg({
            type: UpdateTollTagInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const oldTollTag = await context.prisma.tollTag.findUnique({
          where: {
            id: args.data.id,
          },
          include: {
            depot: {
              select: {
                id: true,
              },
            },
          },
        });

        const tollTag = context.prisma.tollTag.update({
          where: {
            id: args.data.id,
          },
          data: {
            tagNumber: args.data.tagNumber,
            tagProvider: args.data.tagProvider,
            ...upsertConnection(
              'depot',
              oldTollTag?.depot?.id,
              args.data.depotId
            ),
          },
        });
        return tollTag;
      },
    });

    t.nonNull.field('deleteTollTag', {
      type: TollTag,
      args: {
        data: nonNull(
          arg({
            type: DeleteTollTagInput,
          })
        ),
      },
      resolve: (_, args, context: Context) =>
        context.prisma.tollTag.delete({
          where: {
            id: args.data.id,
          },
        }),
    });
  },
});

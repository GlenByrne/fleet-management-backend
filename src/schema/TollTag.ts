import { objectType, nonNull, arg, inputObjectType, extendType } from 'nexus';
import { Context } from '../context';
import { Depot } from './Depot';
import { Vehicle } from './Vehicle';

export const TollTag = objectType({
  name: 'TollTag',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tollTagNumber');
    t.nonNull.string('tollTagProvider');
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
      resolve: (_, __, context: Context) => context.prisma.tollTag.findMany(),
    });

    t.list.field('tollTagsNotAssigned', {
      type: TollTag,
      resolve: (_, __, context: Context) =>
        context.prisma.tollTag.findMany({
          where: {
            vehicleId: null,
          },
        }),
    });
  },
});

const AddTollTagInput = inputObjectType({
  name: 'AddTollTagInput',
  definition(t) {
    t.nonNull.string('tollTagNumber');
    t.nonNull.string('tollTagProvider');
    t.nonNull.string('depotId');
  },
});

const UpdateTollTagNumberInput = inputObjectType({
  name: 'UpdateTollTagNumberInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tollTagNumber');
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
      resolve: (_, args, context: Context) =>
        context.prisma.tollTag.create({
          data: {
            tollTagNumber: args.data.tollTagNumber,
            tollTagProvider: args.data.tollTagProvider,
            depot: {
              connect: {
                id: args.data.depotId,
              },
            },
          },
        }),
    });

    t.nonNull.field('updateTollTagNumber', {
      type: TollTag,
      args: {
        data: nonNull(
          arg({
            type: UpdateTollTagNumberInput,
          })
        ),
      },
      resolve: (_, args, context: Context) =>
        context.prisma.tollTag.update({
          where: {
            id: args.data.id,
          },
          data: {
            tollTagNumber: args.data.tollTagNumber,
          },
        }),
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

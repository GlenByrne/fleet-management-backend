import { objectType, nonNull, arg, inputObjectType, extendType } from 'nexus';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
import { Vehicle } from './Vehicle';

export const TollTag = objectType({
  name: 'TollTag',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
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
  },
});

const TollTagInputFilter = inputObjectType({
  name: 'TollTagInputFilter',
  definition(t) {
    t.string('searchCriteria');
  },
});

export const TollTagQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('tollTags', {
      type: TollTag,
      args: {
        data: arg({
          type: TollTagInputFilter,
        }),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve toll tags. You are not logged in.'
          );
        }

        return context.prisma.tollTag.findMany({
          where: {
            tagNumber: {
              contains:
                args.data?.searchCriteria != null
                  ? args.data.searchCriteria
                  : undefined,
              mode: 'insensitive',
            },
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

        if (!userId) {
          throw new Error(
            'Unable to retrieve unassigned toll tags. You are not logged in.'
          );
        }

        return context.prisma.tollTag.findMany({
          where: {
            vehicleId: null,
          },
          orderBy: {
            tagNumber: 'asc',
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
  },
});

const UpdateTollTagInput = inputObjectType({
  name: 'UpdateTollTagInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
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

        if (!userId) {
          throw new Error('Unable to add toll tag. You are not logged in.');
        }

        const existingTag = await context.prisma.tollTag.findUnique({
          where: {
            tagNumber: args.data.tagNumber,
          },
        });

        if (existingTag) {
          throw new Error('Tag already exists with this number');
        }

        return context.prisma.tollTag.create({
          data: {
            tagNumber: args.data.tagNumber,
            tagProvider: args.data.tagProvider,
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
        try {
          return context.prisma.tollTag.update({
            where: {
              id: args.data.id,
            },
            data: {
              tagNumber: args.data.tagNumber,
              tagProvider: args.data.tagProvider,
            },
          });
        } catch (error) {
          throw new Error('Error updating toll tag');
        }
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
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.tollTag.delete({
            where: {
              id: args.data.id,
            },
          });
        } catch (error) {
          throw new Error('Error deleting toll tag');
        }
      },
    });
  },
});

import { objectType, nonNull, arg, inputObjectType, extendType } from 'nexus';
import { Context } from '../context';

export const TollTag = objectType({
  name: 'TollTag',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tollTagNumber');
  },
});

export const TollTagQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('tollTags', {
      type: TollTag,
      resolve: (_, __, context: Context) => context.prisma.tollTag.findMany(),
    });
  },
});

const AddTollTagInput = inputObjectType({
  name: 'AddTollTagInput',
  definition(t) {
    t.nonNull.string('tollTagNumber');
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
          },
        }),
    });
  },
});

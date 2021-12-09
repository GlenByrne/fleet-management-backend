import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { TollTag } from '@/schema/TollTag/TollTag';

export const UpdateTollTagInput = inputObjectType({
  name: 'UpdateTollTagInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
  },
});

export const updateTollTag = mutationField('updateTollTag', {
  type: nonNull(TollTag),
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

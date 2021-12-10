import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { TollTag } from '@/schema/schemaExports';

export const DeleteTollTagInput = inputObjectType({
  name: 'DeleteTollTagInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const deleteTollTag = mutationField('deleteTollTag', {
  type: nonNull(TollTag),
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

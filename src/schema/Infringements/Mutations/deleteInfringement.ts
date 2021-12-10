import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Infringement } from '@/schema/schemaExports';

export const DeleteInfringementInput = inputObjectType({
  name: 'DeleteInfringementInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const deleteInfringement = mutationField('deleteInfringement', {
  type: nonNull(Infringement),
  args: {
    data: nonNull(
      arg({
        type: DeleteInfringementInput,
      })
    ),
  },
  resolve: (_, args, context: Context) => {
    try {
      return context.prisma.infringement.delete({
        where: {
          id: args.data.id,
        },
      });
    } catch (error) {
      throw new Error('Error deleting infringement');
    }
  },
});

import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Depot } from '@/schema/schemaExports';

export const DeleteDepotInput = inputObjectType({
  name: 'DeleteDepotInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const deleteDepot = mutationField('deleteDepot', {
  type: nonNull(Depot),
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

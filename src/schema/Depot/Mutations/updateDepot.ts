import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Depot } from '@/schema/schemaExports';

export const UpdateDepotInput = inputObjectType({
  name: 'UpdateDepotInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
  },
});

export const updateDepot = mutationField('updateDepot', {
  type: nonNull(Depot),
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

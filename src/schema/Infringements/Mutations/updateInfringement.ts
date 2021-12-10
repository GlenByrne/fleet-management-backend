import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Infringement } from '@/schema/schemaExports';
import { InfringementStatus } from '@/schema/Enum';

export const UpdateInfringementInput = inputObjectType({
  name: 'UpdateInfringementInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.date('dateOccured');
    t.nonNull.field('status', { type: InfringementStatus });
  },
});

export const updateInfringement = mutationField('updateInfringement', {
  type: nonNull(Infringement),
  args: {
    data: nonNull(
      arg({
        type: UpdateInfringementInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    try {
      return context.prisma.infringement.update({
        where: {
          id: args.data.id,
        },
        data: {
          description: args.data.description,
          dateOccured: args.data.dateOccured,
          status: args.data.status,
        },
      });
    } catch (error) {
      throw new Error('Error updating infringement');
    }
  },
});

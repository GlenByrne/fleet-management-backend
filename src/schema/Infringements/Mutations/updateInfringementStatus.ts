import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Infringement } from '@/schema/schemaExports';

export const UpdateInfringementStatusInput = inputObjectType({
  name: 'UpdateInfringementStasusInput',
  definition(t) {
    t.nonNull.string('id');
  },
});

export const updateInfringementStatus = mutationField(
  'updateInfringementStatus',
  {
    type: nonNull(Infringement),
    args: {
      data: nonNull(
        arg({
          type: UpdateInfringementStatusInput,
        })
      ),
    },
    resolve: (_, args, context: Context) => {
      try {
        return context.prisma.infringement.update({
          where: {
            id: args.data.id,
          },
          data: {
            status: 'SIGNED',
          },
        });
      } catch (error) {
        throw new Error('Error updating infringements status');
      }
    },
  }
);

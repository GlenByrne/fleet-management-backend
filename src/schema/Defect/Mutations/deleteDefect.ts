import { arg, inputObjectType, mutationField, nonNull } from 'nexus';
import { Context } from 'src/context';
import { Defect } from '@/schema/schemaExports';

export const DeleteDefectInput = inputObjectType({
  name: 'DeleteDefectInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const deleteDefect = mutationField('deleteDefect', {
  type: nonNull(Defect),
  args: {
    data: nonNull(
      arg({
        type: DeleteDefectInput,
      })
    ),
  },
  resolve: (_, args, context: Context) => {
    try {
      return context.prisma.defect.delete({
        where: {
          id: args.data.id,
        },
      });
    } catch (error) {
      throw new Error('Error deleting defect');
    }
  },
});

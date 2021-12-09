import { arg, inputObjectType, mutationField, nonNull } from 'nexus';
import { Context } from 'src/context';
import { DefectStatus } from '@/schema/Enum';
import { Defect } from '@/schema/Defect/Defect';

export const UpdateDefectInput = inputObjectType({
  name: 'UpdateDefectInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.field('status', {
      type: DefectStatus,
    });
  },
});

export const updateDefect = mutationField('updateDefect', {
  type: nonNull(Defect),
  args: {
    data: nonNull(
      arg({
        type: UpdateDefectInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    try {
      const isComplete = args.data.status === 'COMPLETE';

      return context.prisma.defect.update({
        where: {
          id: args.data.id,
        },
        data: {
          description: args.data.description,
          status: args.data.status,
          dateCompleted: isComplete ? new Date() : null,
        },
      });
    } catch (error) {
      throw new Error('Error updating fuel card');
    }
  },
});

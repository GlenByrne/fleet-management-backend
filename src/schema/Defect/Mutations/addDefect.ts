import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Defect } from '@/schema/schemaExports';

export const AddDefectInput = inputObjectType({
  name: 'AddDefectInput',
  definition(t) {
    t.nonNull.string('description');
    t.nonNull.id('vehicleId');
  },
});

export const addDefect = mutationField('addDefect', {
  type: nonNull(Defect),
  args: {
    data: nonNull(
      arg({
        type: AddDefectInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to add defect. You are not logged in.');
    }

    const user = await context.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('Unable to add defect. You are not logged in.');
    }

    return context.prisma.defect.create({
      data: {
        description: args.data.description,
        dateReported: new Date(),
        reporter: user.name,
        status: 'INCOMPLETE',
        vehicle: {
          connect: {
            id: args.data.vehicleId,
          },
        },
      },
    });
  },
});

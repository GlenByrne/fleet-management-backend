import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { TollTag } from '@/schema/schemaExports';

export const AddTollTagInput = inputObjectType({
  name: 'AddTollTagInput',
  definition(t) {
    t.nonNull.string('tagNumber');
    t.nonNull.string('tagProvider');
    t.nonNull.string('organisationId');
  },
});

export const addTollTag = mutationField('addTollTag', {
  type: nonNull(TollTag),
  args: {
    data: nonNull(
      arg({
        type: AddTollTagInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to add toll tag. You are not logged in.');
    }

    const isInOrganisation =
      await context.prisma.usersOnOrganisations.findUnique({
        where: {
          userId_organisationId: {
            userId,
            organisationId: args.data.organisationId,
          },
        },
      });

    if (!isInOrganisation) {
      throw new Error(
        'Unable to add toll tag. You are not a member of this organisation'
      );
    }

    const existingTag = await context.prisma.tollTag.findUnique({
      where: {
        tagNumber: args.data.tagNumber,
      },
    });

    if (existingTag) {
      throw new Error('Tag already exists with this number');
    }

    return context.prisma.tollTag.create({
      data: {
        tagNumber: args.data.tagNumber,
        tagProvider: args.data.tagProvider,
        organisation: {
          connect: {
            id: args.data.organisationId,
          },
        },
      },
    });
  },
});

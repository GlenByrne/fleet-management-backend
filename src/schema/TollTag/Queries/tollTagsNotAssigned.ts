import { queryField, nonNull, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { TollTag } from '@/schema/schemaExports';

export const TollTagsNotAssignedInput = inputObjectType({
  name: 'TollTagsNotAssignedInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const tollTagsNotAssigned = queryField('tollTagsNotAssigned', {
  type: nonNull(list(nonNull(TollTag))),
  args: {
    data: nonNull(
      arg({
        type: TollTagsNotAssignedInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error(
        'Unable to retrieve unassigned toll tags. You are not logged in.'
      );
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
        'Unable to retrieve unassigned toll tags. You are not a member of this organisation'
      );
    }

    return context.prisma.tollTag.findMany({
      where: {
        AND: [
          { vehicleId: null },
          { organisationId: args.data.organisationId },
        ],
      },
      orderBy: {
        tagNumber: 'asc',
      },
    });
  },
});

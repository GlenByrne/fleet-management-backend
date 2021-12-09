import { inputObjectType, queryField, nonNull, arg, list } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { TollTag } from '@/schema/TollTag/TollTag';

export const TollTagInputFilter = inputObjectType({
  name: 'TollTagInputFilter',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

export const tollTags = queryField('tollTags', {
  type: list(TollTag),
  args: {
    data: nonNull(
      arg({
        type: TollTagInputFilter,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to retreive toll tags. You are not logged in.');
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
        'Unable to retreive toll tags. You are not a member of this organisation'
      );
    }

    return context.prisma.tollTag.findMany({
      where: {
        AND: [
          { organisationId: args.data.organisationId },
          {
            tagNumber: {
              contains:
                args.data?.searchCriteria != null
                  ? args.data.searchCriteria
                  : undefined,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        tagNumber: 'asc',
      },
    });
  },
});

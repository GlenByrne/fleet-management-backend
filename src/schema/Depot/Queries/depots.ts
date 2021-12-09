import { inputObjectType, queryField, nonNull, arg, list } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Depot } from '@/schema/Depot/Depot';

export const DepotInputFilter = inputObjectType({
  name: 'DepotInputFilter',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

export const depots = queryField('depots', {
  type: list(Depot),
  args: {
    data: nonNull(
      arg({
        type: DepotInputFilter,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to retrieve depots. You are not logged in.');
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
        'Unable to retrieve depots. You are not a member of this organisation'
      );
    }

    return context.prisma.depot.findMany({
      where: {
        AND: [
          { organisationId: args.data.organisationId },
          {
            name: {
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
        name: 'asc',
      },
    });
  },
});

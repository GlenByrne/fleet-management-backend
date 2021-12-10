import { inputObjectType, queryField, nonNull, arg, list } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { FuelCard } from '@/schema/schemaExports';

export const FuelCardInputFilter = inputObjectType({
  name: 'FuelCardInputFilter',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

export const fuelCards = queryField('fuelCards', {
  type: list(FuelCard),
  args: {
    data: nonNull(
      arg({
        type: FuelCardInputFilter,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error('Unable to retrieve fuel cards. You are not logged in.');
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
        'Unable to retrieve fuel cards. You are not a member of this organisation'
      );
    }

    return context.prisma.fuelCard.findMany({
      where: {
        AND: [
          { organisationId: args.data.organisationId },
          {
            cardNumber: {
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
        cardNumber: 'asc',
      },
    });
  },
});

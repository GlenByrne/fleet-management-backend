import { queryField, nonNull, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { FuelCard } from '@/schema/schemaExports';

export const FuelCardsNotAssignedInput = inputObjectType({
  name: 'FuelCardsNotAssignedInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const fuelCardsNotAssigned = queryField('fuelCardsNotAssigned', {
  type: list(FuelCard),
  args: {
    data: nonNull(
      arg({
        type: FuelCardsNotAssignedInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error(
        'Unable to retrieve unassigned fuel cards. You are not logged in.'
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
        'Unable to retrieve fuel cards. You are not a member of this organisation'
      );
    }

    return context.prisma.fuelCard.findMany({
      where: {
        AND: [
          { vehicleId: null },
          { organisationId: args.data.organisationId },
        ],
      },
      orderBy: {
        cardNumber: 'asc',
      },
    });
  },
});

import { queryField, nonNull, idArg, list } from 'nexus';
import { Context } from 'src/context';
import { getDateTwoWeeks } from '@/utilities/getDateTwoWeeks';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const upcomingThirteenWeek = queryField('upcomingThirteenWeek', {
  type: list(Vehicle),
  args: {
    organisationId: nonNull(idArg()),
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
            organisationId: args.organisationId,
          },
        },
      });

    if (!isInOrganisation) {
      throw new Error(
        'Unable to retrieve depots. You are not a member of this organisation'
      );
    }

    return context.prisma.vehicle.findMany({
      where: {
        AND: [
          { organisationId: args.organisationId },
          {
            thirteenWeekInspection: {
              lte: getDateTwoWeeks(),
            },
          },
        ],
      },
      orderBy: {
        thirteenWeekInspection: 'asc',
      },
    });
  },
});

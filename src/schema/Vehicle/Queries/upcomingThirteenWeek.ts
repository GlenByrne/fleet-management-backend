import { queryField, nonNull, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { getDateTwoWeeks } from '@/utilities/getDateTwoWeeks';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Vehicle } from '@/schema/schemaExports';

export const UpcomingThirteenWeekInput = inputObjectType({
  name: 'UpcomingThirteenWeekInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const upcomingThirteenWeek = queryField('upcomingThirteenWeek', {
  type: list(Vehicle),
  args: {
    data: nonNull(
      arg({
        type: UpcomingThirteenWeekInput,
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

    return context.prisma.vehicle.findMany({
      where: {
        AND: [
          { organisationId: args.data.organisationId },
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

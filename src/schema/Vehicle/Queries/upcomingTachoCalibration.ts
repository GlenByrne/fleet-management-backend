import { queryField, nonNull, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { getDateTwoWeeks } from '@/utilities/getDateTwoWeeks';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Vehicle } from '@/schema/schemaExports';

export const UpcomingTachoCalibrationInput = inputObjectType({
  name: 'UpcomingTachoCalibrationInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const upcomingTachoCalibration = queryField('upcomingTachoCalibration', {
  type: list(Vehicle),
  args: {
    data: nonNull(
      arg({
        type: UpcomingTachoCalibrationInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error(
        'Unable to retrieve upcoming tacho cals. You are not logged in.'
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
        'Unable to retrieve upcoming tacho cals. You are not a member of this organisation'
      );
    }

    return context.prisma.vehicle.findMany({
      where: {
        AND: [
          { organisationId: args.data.organisationId },
          {
            tachoCalibration: {
              lte: getDateTwoWeeks(),
            },
          },
        ],
      },
      orderBy: {
        tachoCalibration: 'asc',
      },
    });
  },
});

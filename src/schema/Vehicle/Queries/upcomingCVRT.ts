import { queryField, nonNull, idArg, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { getDateTwoWeeks } from '@/utilities/getDateTwoWeeks';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Vehicle } from '@/schema/schemaExports';

export const UpcomingCVRTInput = inputObjectType({
  name: 'UpcomingCVRTInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const upcomingCVRT = queryField('upcomingCVRT', {
  type: list(Vehicle),
  args: {
    data: nonNull(
      arg({
        type: UpcomingCVRTInput,
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
            cvrt: {
              lte: getDateTwoWeeks(),
            },
          },
        ],
      },
      orderBy: {
        cvrt: 'asc',
      },
    });
  },
});

import { queryField, nonNull, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { getDateTwoWeeks } from '@/utilities/getDateTwoWeeks';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Vehicle } from '@/schema/schemaExports';
import { cursorToOffset, connectionFromArraySlice } from 'graphql-relay';

export const UpcomingTachoCalibrationInput = inputObjectType({
  name: 'UpcomingTachoCalibrationInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const upcomingTachoCalibration = queryField((t) => {
  t.connectionField('upcomingTachoCalibration', {
    type: Vehicle,
    nullable: false,
    additionalArgs: {
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

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.vehicle.count({
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
        }),
        context.prisma.vehicle.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
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
        }),
      ]);

      return connectionFromArraySlice(
        items,
        { first: args.first, after: args.after },
        { sliceStart: offset, arrayLength: totalCount }
      );
    },
  });
});

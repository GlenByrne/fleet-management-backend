import { queryField, nonNull, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { cursorToOffset, connectionFromArraySlice } from 'graphql-relay';
import { getDateTwoWeeks } from '@/utilities/getDateTwoWeeks';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Vehicle } from '@/schema/schemaExports';

export const UpcomingThirteenWeekInput = inputObjectType({
  name: 'UpcomingThirteenWeekInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const upcomingThirteenWeek = queryField((t) => {
  t.connectionField('upcomingThirteenWeek', {
    type: Vehicle,
    nullable: false,
    additionalArgs: {
      data: nonNull(
        arg({
          type: UpcomingThirteenWeekInput,
        })
      ),
    },
    resolve: async (_, args, context: Context) => {
      const userId = verifyAccessToken(context);

      if (!userId) {
        throw new Error(
          'Unable to retrieve fuel cards. You are not logged in.'
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
                thirteenWeekInspection: {
                  lte: getDateTwoWeeks(),
                },
              },
            ],
          },
          orderBy: {
            thirteenWeekInspection: 'asc',
          },
        }),
        context.prisma.vehicle.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
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

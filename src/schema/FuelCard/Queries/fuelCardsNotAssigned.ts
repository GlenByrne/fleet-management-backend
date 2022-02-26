import { queryField, nonNull, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { FuelCard } from '@/schema/schemaExports';
import { cursorToOffset, connectionFromArraySlice } from 'graphql-relay';

export const FuelCardsNotAssignedInput = inputObjectType({
  name: 'FuelCardsNotAssignedInput',
  definition(t) {
    t.nonNull.id('organisationId');
  },
});

export const fuelCardsNotAssigned = queryField((t) => {
  t.connectionField('fuelCardsNotAssigned', {
    type: FuelCard,
    nullable: false,
    additionalArgs: {
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

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.fuelCard.count({
          where: {
            AND: [
              { vehicleId: null },
              { organisationId: args.data.organisationId },
            ],
          },
        }),
        context.prisma.fuelCard.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
          where: {
            AND: [
              { vehicleId: null },
              { organisationId: args.data.organisationId },
            ],
          },
          orderBy: {
            cardNumber: 'asc',
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

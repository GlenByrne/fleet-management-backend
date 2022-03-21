import { inputObjectType, queryField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { FuelCard } from '@/schema/schemaExports';

export const FuelCardsInput = inputObjectType({
  name: 'FuelCardsInput',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

export const fuelCards = queryField((t) => {
  t.connectionField('fuelCards', {
    type: FuelCard,
    nullable: false,
    additionalArgs: {
      data: nonNull(
        arg({
          type: FuelCardsInput,
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
        context.prisma.fuelCard.count({
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
        }),
        context.prisma.fuelCard.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
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

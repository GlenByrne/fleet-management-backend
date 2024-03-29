import { inputObjectType, queryField, nonNull, arg, list } from 'nexus';
import { Context } from 'src/context';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Depot } from '@/schema/schemaExports';

export const DepotsInput = inputObjectType({
  name: 'DepotsInput',
  definition(t) {
    t.nonNull.string('organisationId');
  },
});

export const DepotsPaginatedInput = inputObjectType({
  name: 'DepotsPaginatedInput',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

export const depots = queryField('depots', {
  type: nonNull(list(nonNull(Depot))),
  args: {
    data: nonNull(
      arg({
        type: DepotsInput,
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

    return context.prisma.depot.findMany({
      where: {
        organisationId: args.data.organisationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  },
});

export const depotsPaginated = queryField((t) => {
  t.connectionField('depotsPaginated', {
    type: Depot,
    nullable: false,
    additionalArgs: {
      data: nonNull(
        arg({
          type: DepotsPaginatedInput,
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

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.depot.count({
          where: {
            AND: [
              { organisationId: args.data.organisationId },
              {
                name: {
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
        context.prisma.depot.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
          where: {
            AND: [
              { organisationId: args.data.organisationId },
              {
                name: {
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
            name: 'asc',
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

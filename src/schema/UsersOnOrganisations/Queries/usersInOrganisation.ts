import { inputObjectType, objectType, queryField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { cursorToOffset, connectionFromArraySlice } from 'graphql-relay';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Role } from '@/schema/Enum';
import { Infringement, Depot } from '@/schema/schemaExports';

export const UsersInOrganisationInput = inputObjectType({
  name: 'UsersInOrganisationInput',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

export const UsersNoOrgsPayload = objectType({
  name: 'UsersNoOrgsPayload',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.list.nonNull.field('infringements', {
      type: Infringement,
    });
  },
});

export const UsersInOrganisationPayload = objectType({
  name: 'UsersInOrganisationPayload',
  definition(t) {
    t.nonNull.field('user', {
      type: UsersNoOrgsPayload,
    });
    t.nonNull.field('role', {
      type: Role,
    });
    t.field('depot', {
      type: Depot,
    });
  },
});

export const usersInOrganisation = queryField((t) => {
  t.connectionField('usersInOrganisation', {
    type: UsersInOrganisationPayload,
    nullable: false,
    additionalArgs: {
      data: nonNull(
        arg({
          type: UsersInOrganisationInput,
        })
      ),
    },
    resolve: async (_, args, context: Context) => {
      const userId = verifyAccessToken(context);

      if (!userId) {
        throw new Error(
          'Unable to get organisations users. You are not logged in.'
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
          'Unable to get organisations users. You are not a member of this organisation'
        );
      }

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.usersOnOrganisations.count({
          where: {
            AND: [
              { organisationId: args.data.organisationId },
              { inviteAccepted: true },
              {
                user: {
                  name: {
                    contains:
                      args.data?.searchCriteria != null
                        ? args.data.searchCriteria
                        : undefined,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        }),
        context.prisma.usersOnOrganisations.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
          where: {
            AND: [
              { organisationId: args.data.organisationId },
              { inviteAccepted: true },
              {
                user: {
                  name: {
                    contains:
                      args.data?.searchCriteria != null
                        ? args.data.searchCriteria
                        : undefined,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
          select: {
            role: true,
            depot: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                infringements: true,
                organisations: false,
              },
            },
          },

          orderBy: {
            user: {
              name: 'asc',
            },
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

import { queryField } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { UsersOnOrganisations } from '@/schema/schemaExports';
import { cursorToOffset, connectionFromArraySlice } from 'graphql-relay';

export const usersOrganisationInvites = queryField((t) => {
  t.connectionField('usersOrganisationInvites', {
    type: UsersOnOrganisations,
    nullable: false,
    resolve: async (_, args, context: Context) => {
      const userId = verifyAccessToken(context);

      if (!userId) {
        throw new Error(
          'Unable to retrieve fuel cards. You are not logged in.'
        );
      }

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.usersOnOrganisations.count({
          where: {
            AND: [{ userId }, { inviteAccepted: false }],
          },
        }),
        context.prisma.usersOnOrganisations.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
          where: {
            AND: [{ userId }, { inviteAccepted: false }],
          },
          orderBy: {
            organisation: {
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

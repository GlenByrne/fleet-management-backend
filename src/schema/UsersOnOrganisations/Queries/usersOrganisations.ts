import { queryField } from 'nexus';
import { Context } from 'src/context';
import { cursorToOffset, connectionFromArraySlice } from 'graphql-relay';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { UsersOnOrganisations } from '@/schema/schemaExports';

const usersOrganisations = queryField((t) => {
  t.connectionField('usersOrganisations', {
    type: UsersOnOrganisations,
    nullable: false,
    resolve: async (_, args, context: Context) => {
      const userId = verifyAccessToken(context);

      if (!userId) {
        throw new Error(
          'Unable to retrieve your organisations. You are not logged in.'
        );
      }

      const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

      if (Number.isNaN(offset)) {
        throw new Error('Cursor is invalid');
      }

      const [totalCount, items] = await Promise.all([
        context.prisma.usersOnOrganisations.count({
          where: {
            AND: [{ userId }, { inviteAccepted: true }],
          },
        }),
        context.prisma.usersOnOrganisations.findMany({
          take: args.first ? args.first : undefined,
          skip: offset,
          where: {
            AND: [{ userId }, { inviteAccepted: true }],
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

export default usersOrganisations;

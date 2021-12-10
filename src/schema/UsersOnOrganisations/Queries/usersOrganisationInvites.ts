import { list, queryField } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { UsersOnOrganisations } from '@/schema/schemaExports';

export const usersOrganisationInvites = queryField('usersOrganisationInvites', {
  type: list(UsersOnOrganisations),
  resolve: async (_, __, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error(
        'Unable to retrieve your invites. You are not logged in.'
      );
    }

    return context.prisma.usersOnOrganisations.findMany({
      where: {
        AND: [
          {
            userId,
          },
          {
            inviteAccepted: false,
          },
        ],
      },
      orderBy: {
        organisation: {
          name: 'asc',
        },
      },
    });
  },
});

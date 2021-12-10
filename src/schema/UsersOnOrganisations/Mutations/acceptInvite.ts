import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { UsersOnOrganisations } from '@/schema/schemaExports';

export const AcceptInviteInput = inputObjectType({
  name: 'AcceptInviteInput',
  definition(t) {
    t.nonNull.string('organisationId');
  },
});

export const acceptInvite = mutationField('acceptInvite', {
  type: nonNull(UsersOnOrganisations),
  args: {
    data: nonNull(
      arg({
        type: AcceptInviteInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    const userId = verifyAccessToken(context);

    if (!userId) {
      throw new Error(
        'Unable to add user to organisation. You are not logged in.'
      );
    }

    return context.prisma.usersOnOrganisations.update({
      where: {
        userId_organisationId: {
          userId,
          organisationId: args.data.organisationId,
        },
      },
      data: {
        inviteAccepted: true,
      },
    });
  },
});

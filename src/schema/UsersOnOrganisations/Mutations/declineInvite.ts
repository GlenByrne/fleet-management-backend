import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { UsersOnOrganisations } from '@/schema/schemaExports';

export const DeclineInviteInput = inputObjectType({
  name: 'DeclineInviteInput',
  definition(t) {
    t.nonNull.string('organisationId');
  },
});
export const declineInvite = mutationField('declineInvite', {
  type: nonNull(UsersOnOrganisations),
  args: {
    data: nonNull(
      arg({
        type: DeclineInviteInput,
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

    const usersOnOrganisations =
      await context.prisma.usersOnOrganisations.delete({
        where: {
          userId_organisationId: {
            userId,
            organisationId: args.data.organisationId,
          },
        },
      });

    return usersOnOrganisations;
  },
});

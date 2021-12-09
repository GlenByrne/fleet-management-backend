import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { UsersOnOrganisations } from '@/schema/UsersOnOrganisations/UsersOnOrganisations';

export const RemoveUserFromOrganisationInput = inputObjectType({
  name: 'RemoveUserFromOrganisationInput',
  definition(t) {
    t.nonNull.id('userId');
    t.nonNull.string('organisationId');
  },
});

export const removeUserFromOrganisation = mutationField(
  'removeUserFromOrganisation',
  {
    type: nonNull(UsersOnOrganisations),
    args: {
      data: nonNull(
        arg({
          type: RemoveUserFromOrganisationInput,
        })
      ),
    },
    resolve: (_, args, context: Context) => {
      try {
        return context.prisma.usersOnOrganisations.delete({
          where: {
            userId_organisationId: {
              userId: args.data.userId,
              organisationId: args.data.organisationId,
            },
          },
        });
      } catch (error) {
        throw new Error('Error removing user from organisation');
      }
    },
  }
);

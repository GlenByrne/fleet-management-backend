import { objectType } from 'nexus';
import { Context } from 'src/context';
import { Role } from '@/schema/Enum';
import { User, Organisation } from '@/schema/schemaExports';

export const UsersOnOrganisations = objectType({
  name: 'UsersOnOrganisations',
  definition(t) {
    t.nonNull.field('role', {
      type: Role,
    });
    t.nonNull.boolean('inviteAccepted');
    t.nonNull.id('userId');
    t.nonNull.id('organisationId');
    t.nonNull.field('user', {
      type: User,
      resolve: async (parent, _, context: Context) => {
        const user = await context.prisma.usersOnOrganisations
          .findUnique({
            where: {
              userId_organisationId: {
                userId: parent.userId,
                organisationId: parent.organisationId,
              },
            },
          })
          .user();

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      },
    });
    t.nonNull.field('organisation', {
      type: Organisation,
      resolve: async (parent, _, context: Context) => {
        const organisation = await context.prisma.usersOnOrganisations
          .findUnique({
            where: {
              userId_organisationId: {
                userId: parent.userId,
                organisationId: parent.organisationId,
              },
            },
          })
          .organisation();

        if (!organisation) {
          throw new Error('Organisation not found');
        }

        return organisation;
      },
    });
  },
});

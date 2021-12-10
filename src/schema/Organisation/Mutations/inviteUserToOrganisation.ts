import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { createConnection } from '@/utilities/createConnection';
import { Role } from '@/schema/Enum';
import { verifyAccessToken } from '@/utilities/verifyAccessToken';
import { Organisation } from '@/schema/schemaExports';

export const InviteUserToOrganisationInput = inputObjectType({
  name: 'InviteUserToOrganisationInput',
  definition(t) {
    t.nonNull.string('email');
    t.nonNull.string('organisationId');
    t.nonNull.field('role', {
      type: Role,
    });
    t.nonNull.string('depotId');
  },
});

export const inviteUserToOrganisation = mutationField(
  'inviteUserToOrganisation',
  {
    type: nonNull(Organisation),
    args: {
      data: nonNull(
        arg({
          type: InviteUserToOrganisationInput,
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
          'Unable to add user to organisation. You are not a member of this organisation'
        );
      }

      const invitedUser = await context.prisma.user.findUnique({
        where: {
          email: args.data.email,
        },
      });

      if (!invitedUser) {
        throw new Error("This user doesn't exist");
      }

      const alreadyInOrganisation =
        await context.prisma.usersOnOrganisations.findUnique({
          where: {
            userId_organisationId: {
              userId: invitedUser.id,
              organisationId: args.data.organisationId,
            },
          },
        });

      if (alreadyInOrganisation) {
        throw new Error('User has already been added to this organisation');
      }

      return context.prisma.organisation.update({
        where: {
          id: args.data.organisationId,
        },
        data: {
          users: {
            create: [
              {
                user: {
                  connect: {
                    id: invitedUser.id,
                  },
                },
                role: args.data.role,
                ...createConnection('depot', args.data.depotId),
              },
            ],
          },
        },
      });
    },
  }
);

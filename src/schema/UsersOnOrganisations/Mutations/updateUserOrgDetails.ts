import {
  inputObjectType,
  objectType,
  mutationField,
  nonNull,
  arg,
} from 'nexus';
import { Context } from 'src/context';
import { upsertConnection } from '@/utilities/upsertConnection';
import { Infringement, Depot } from '@/schema/schemaExports';
import { Role } from '@/schema/Enum';

export const UpdateUserOrgDetailsInput = inputObjectType({
  name: 'UpdateUserOrgDetailsInput',
  definition(t) {
    t.nonNull.id('userId');
    t.nonNull.string('organisationId');
    t.nonNull.string('depotId');
    t.nonNull.field('role', { type: Role });
  },
});

export const UpdateUserOrgDetailsPayload = objectType({
  name: 'UpdateUserOrgDetailsPayload',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.list.nonNull.field('infringements', {
      type: Infringement,
    });
    t.nonNull.field('role', {
      type: Role,
    });
    t.field('depot', {
      type: Depot,
    });
  },
});

export const updateUserOrgDetails = mutationField('updateUserOrgDetails', {
  type: nonNull(UpdateUserOrgDetailsPayload),
  args: {
    data: nonNull(
      arg({
        type: UpdateUserOrgDetailsInput,
      })
    ),
  },
  resolve: async (_, args, context: Context) => {
    try {
      const oldUserOrgDetails =
        await context.prisma.usersOnOrganisations.findUnique({
          where: {
            userId_organisationId: {
              userId: args.data.userId,
              organisationId: args.data.organisationId,
            },
          },
          include: {
            depot: {
              select: {
                id: true,
              },
            },
          },
        });

      const userOrgDetails = await context.prisma.usersOnOrganisations.update({
        where: {
          userId_organisationId: {
            userId: args.data.userId,
            organisationId: args.data.organisationId,
          },
        },
        data: {
          role: args.data.role,
          ...upsertConnection(
            'depot',
            oldUserOrgDetails?.depot?.id,
            args.data.depotId
          ),
        },
        include: {
          depot: true,
          user: {
            include: {
              infringements: true,
            },
          },
        },
      });

      return {
        id: userOrgDetails.user.id,
        name: userOrgDetails.user.name,
        email: userOrgDetails.user.email,
        role: userOrgDetails.role,
        depot: userOrgDetails.depot,
        infringements: userOrgDetails.user.infringements,
      };
    } catch (error) {
      throw new Error('Error updating user');
    }
  },
});

import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { Context } from '../context';
import createConnection from '../utilities/createConnection';
import getUserId from '../utilities/getUserId';
import upsertConnection from '../utilities/upsertConnection';
import { Depot } from './Depot';
import { Role } from './Enum';
import Infringement from './Infringement';
import { Organisation } from './Organisation';
import { User, UsersPayload } from './User';

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
      type: UsersPayload,
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
          .user({
            select: {
              id: true,
              name: true,
              email: true,
              infringements: true,
              organisations: true,
            },
          });

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

const UsersInOrganisationInputFilter = inputObjectType({
  name: 'UsersInOrganisationInputFilter',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

const DriversInOrganisationInputFilter = inputObjectType({
  name: 'DriversInOrganisationInputFilter',
  definition(t) {
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

export const OrganisationsListPayload = objectType({
  name: 'OrganisationsListPayload',
  definition(t) {
    t.field('role', {
      type: Role,
    });
    t.field('organisation', {
      type: Organisation,
    });
  },
});

export const UsersOrganisationsPayload = objectType({
  name: 'UsersOrganisationsPayload',
  definition(t) {
    t.list.field('organisations', {
      type: OrganisationsListPayload,
    });
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

export const DriversInOrganisationPayload = objectType({
  name: 'DriversInOrganisationPayload',
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

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('usersOrganisations', {
      type: UsersOnOrganisations,
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve your organisations. You are not logged in.'
          );
        }

        return context.prisma.usersOnOrganisations.findMany({
          where: {
            AND: [{ userId }, { inviteAccepted: true }],
          },
          orderBy: {
            organisation: {
              name: 'asc',
            },
          },
        });
      },
    });

    t.list.field('usersOrganisationInvites', {
      type: UsersOnOrganisations,
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

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

    t.list.field('usersInOrganisation', {
      type: UsersInOrganisationPayload,
      args: {
        data: nonNull(
          arg({
            type: UsersInOrganisationInputFilter,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

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

        return context.prisma.usersOnOrganisations.findMany({
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
        });
      },
    });

    t.nonNull.list.nonNull.field('driversInOrganisation', {
      type: DriversInOrganisationPayload,
      args: {
        data: nonNull(
          arg({
            type: DriversInOrganisationInputFilter,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to get organisations drivers. You are not logged in.'
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
            'Unable to get organisations drivers. You are not a member of this organisation'
          );
        }

        return context.prisma.usersOnOrganisations.findMany({
          where: {
            AND: [
              { organisationId: args.data.organisationId },
              {
                role: 'DRIVER',
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
        });
      },
    });
  },
});

const UpdateUserOrgDetailsInput = inputObjectType({
  name: 'UpdateUserOrgDetailsInput',
  definition(t) {
    t.nonNull.id('userId');
    t.nonNull.string('organisationId');
    t.nonNull.string('depotId');
    t.nonNull.field('role', { type: Role });
  },
});

const RemoveUserFromOrganisationInput = inputObjectType({
  name: 'RemoveUserFromOrganisationInput',
  definition(t) {
    t.nonNull.id('userId');
    t.nonNull.string('organisationId');
  },
});

const AcceptInviteInput = inputObjectType({
  name: 'AcceptInviteInput',
  definition(t) {
    t.nonNull.string('organisationId');
  },
});

const DeclineInviteInput = inputObjectType({
  name: 'DeclineInviteInput',
  definition(t) {
    t.nonNull.string('organisationId');
  },
});

export const UsersOnOrganisationsMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateUserOrgDetails', {
      type: UpdateUserOrgDetailsPayload,
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

          const userOrgDetails =
            await context.prisma.usersOnOrganisations.update({
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

    t.nonNull.field('removeUserFromOrganisation', {
      type: UsersOnOrganisations,
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
    });

    t.nonNull.field('acceptInvite', {
      type: UsersOnOrganisations,
      args: {
        data: nonNull(
          arg({
            type: AcceptInviteInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

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

    t.nonNull.field('declineInvite', {
      type: UsersOnOrganisations,
      args: {
        data: nonNull(
          arg({
            type: DeclineInviteInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

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
  },
});

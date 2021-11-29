import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { Context } from '../context';
import checkIsLoggedInAndInOrg from '../utilities/checkIsLoggedInAndInOrg';
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
    t.nonNull.boolean('isDefault');
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
              password: false,
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
  },
});

export const AddUserToOrganisationPayload = objectType({
  name: 'AddUserToOrganisationPayload',
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
        checkIsLoggedInAndInOrg(context, args.data.organisationId);

        return context.prisma.usersOnOrganisations.findMany({
          where: {
            AND: [
              { organisationId: args.data.organisationId },
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
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                infringements: true,
                password: false,
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
        checkIsLoggedInAndInOrg(context, args.data.organisationId);

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
                password: false,
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

const AddUserToOrganisationInput = inputObjectType({
  name: 'AddUserToOrganisationInput',
  definition(t) {
    t.nonNull.id('userId');
    t.nonNull.string('organisationId');
    t.nonNull.field('role', {
      type: Role,
    });
    t.nonNull.string('depotId');
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

    t.nonNull.field('addUserToOrganisation', {
      type: AddUserToOrganisationPayload,
      args: {
        data: nonNull(
          arg({
            type: AddUserToOrganisationInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        checkIsLoggedInAndInOrg(context, args.data.organisationId);

        const existingUser =
          await context.prisma.usersOnOrganisations.findUnique({
            where: {
              userId_organisationId: {
                userId: args.data.userId,
                organisationId: args.data.organisationId,
              },
            },
          });

        if (existingUser) {
          throw new Error('User has already been added to this organisation');
        }

        const newUserToOrgLink =
          await context.prisma.usersOnOrganisations.create({
            data: {
              user: {
                connect: {
                  id: args.data.userId,
                },
              },
              organisation: {
                connect: {
                  id: args.data.organisationId,
                },
              },
              ...createConnection('depot', args.data.depotId),
              role: args.data.role,
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
          id: newUserToOrgLink.user.id,
          name: newUserToOrgLink.user.name,
          email: newUserToOrgLink.user.email,
          role: newUserToOrgLink.role,
          depot: newUserToOrgLink.depot,
          infringements: newUserToOrgLink.user.infringements,
        };
      },
    });
  },
});

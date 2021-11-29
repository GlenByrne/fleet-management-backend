import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { Context } from '../context';
import checkIsLoggedInAndInOrg from '../utilities/checkIsLoggedInAndInOrg';
import getUserId from '../utilities/getUserId';
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

export default UsersOnOrganisations;

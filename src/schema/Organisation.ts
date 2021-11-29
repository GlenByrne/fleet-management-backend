import { hash } from 'bcrypt';
import { objectType, nonNull, extendType, arg, inputObjectType } from 'nexus';
import { Context } from '../context';
import { Depot } from './Depot';
import { FuelCard } from './FuelCard';
import { TollTag } from './TollTag';
import { Vehicle } from './Vehicle';
import { User, UsersPayload } from './User';
import generateAccessToken from '../utilities/generateAccessToken';
import generateRefreshToken from '../utilities/generateRefreshToken';
import getUserId from '../utilities/getUserId';
import { UsersOnOrganisations } from './UsersOnOrganisations';

export const Organisation = objectType({
  name: 'Organisation',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.list.nonNull.field('users', {
      type: UsersOnOrganisations,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .users();
      },
    });
    t.nonNull.list.nonNull.field('vehicles', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .vehicles();
      },
    });
    t.nonNull.list.nonNull.field('depots', {
      type: Depot,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .depots();
      },
    });
    t.nonNull.list.nonNull.field('fuelCards', {
      type: FuelCard,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .fuelCards();
      },
    });
    t.nonNull.list.nonNull.field('tollTags', {
      type: TollTag,
      resolve(parent, _, context: Context) {
        return context.prisma.organisation
          .findUnique({
            where: { id: parent.id },
          })
          .tollTags();
      },
    });
  },
});

export const OrganisationQuery = extendType({
  type: 'Query',
  definition(t) {
    // t.field('organisation', {
    //   type: Organisation,
    //   args: {
    //     organisationId: nonNull(idArg()),
    //   },
    //   resolve: (_, { organisationId }, context: Context) =>
    //     context.prisma.organisation.findUnique({
    //       where: {
    //         id: organisationId,
    //       },
    //     }),
    // });
    // t.list.field('users', {
    //   type: User,
    //   args: {
    //     organisationId: nonNull(idArg()),
    //   },
    //   resolve: (_, { organisationId }, context: Context) =>
    //     context.prisma.organisation
    //       .findUnique({
    //         where: {
    //           id: organisationId,
    //         },
    //       })
    //       .users(),
    // });
    // t.list.field('vehicles', {
    //   type: Vehicle,
    //   args: {
    //     organisationId: nonNull(idArg()),
    //   },
    //   resolve: (_, { organisationId }, context: Context) =>
    //     context.prisma.organisation
    //       .findUnique({
    //         where: {
    //           id: organisationId,
    //         },
    //       })
    //       .vehicles(),
    // });
    // t.list.field('depots', {
    //   type: Depot,
    //   args: {
    //     organisationId: nonNull(idArg()),
    //   },
    //   resolve: (_, { organisationId }, context: Context) =>
    //     context.prisma.organisation
    //       .findUnique({
    //         where: {
    //           id: organisationId,
    //         },
    //       })
    //       .depots(),
    // });
    // t.list.field('fuelCards', {
    //   type: FuelCard,
    //   args: {
    //     organisationId: nonNull(idArg()),
    //   },
    //   resolve: (_, { organisationId }, context: Context) =>
    //     context.prisma.organisation
    //       .findUnique({
    //         where: {
    //           id: organisationId,
    //         },
    //       })
    //       .fuelCards(),
    // });
    // t.list.field('tollTags', {
    //   type: TollTag,
    //   args: {
    //     organisationId: nonNull(idArg()),
    //   },
    //   resolve: (_, { organisationId }, context: Context) =>
    //     context.prisma.organisation
    //       .findUnique({
    //         where: {
    //           id: organisationId,
    //         },
    //       })
    //       .tollTags(),
    // });
  },
});

const AddOrganisationInput = inputObjectType({
  name: 'AddOrganisationInput',
  definition(t) {
    t.nonNull.string('name');
  },
});

export const OrganisationMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addOrganisation', {
      type: Organisation,
      args: {
        data: nonNull(
          arg({
            type: AddOrganisationInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error('Unable to retrieve users. You are not logged in.');
        }

        const organisationCount =
          await context.prisma.usersOnOrganisations.count();

        const organisation = await context.prisma.organisation.create({
          data: {
            name: args.data.name,
            users: {
              create: [
                {
                  user: {
                    connect: {
                      id: userId,
                    },
                  },
                  role: 'OWNER',
                  isDefault: organisationCount === 0,
                },
              ],
            },
          },
        });

        return organisation;
      },
    });
  },
});

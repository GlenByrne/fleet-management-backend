import { arg, extendType, inputObjectType, nonNull, objectType } from 'nexus';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
import { InfringementStatus } from './Enum';
import { UsersPayload } from './User';

const Infringement = objectType({
  name: 'Infringement',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.date('dateOccured');
    t.nonNull.field('status', {
      type: InfringementStatus,
    });
    t.field('driver', {
      type: UsersPayload,
      resolve(parent, _, context: Context) {
        return context.prisma.infringement
          .findUnique({
            where: { id: parent.id },
          })
          .driver({
            select: {
              id: true,
              name: true,
              email: true,
              infringements: true,
              organisations: true,
            },
          });
      },
    });
  },
});

const AddInfringementInput = inputObjectType({
  name: 'AddInfringementInput',
  definition(t) {
    t.nonNull.id('driverId');
    t.nonNull.string('description');
    t.nonNull.date('dateOccured');
    t.nonNull.string('organisationId');
  },
});

const UpdateInfringementInput = inputObjectType({
  name: 'UpdateInfringementInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('description');
    t.nonNull.date('dateOccured');
    t.nonNull.field('status', { type: InfringementStatus });
  },
});

const DeleteInfringementInput = inputObjectType({
  name: 'DeleteInfringementInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

const UpdateInfringementStasusInput = inputObjectType({
  name: 'UpdateInfringementStasusInput',
  definition(t) {
    t.nonNull.string('id');
  },
});

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('infringements', {
      type: Infringement,
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve infringements. You are not logged in.'
          );
        }

        return context.prisma.infringement.findMany({
          orderBy: {
            dateOccured: 'desc',
          },
        });
      },
    });
  },
});

export const InfringementMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addInfringement', {
      type: Infringement,
      args: {
        data: nonNull(
          arg({
            type: AddInfringementInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error('Unable to add infringement. You are not logged in.');
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
            'Unable to add infringement. You are not a member of this organisation'
          );
        }

        const driver = await context.prisma.user.findUnique({
          where: {
            id: args.data.driverId,
          },
        });

        if (!driver) {
          throw new Error('Unable to add infringemnt. Driver not found.');
        }

        const userOrgConnection =
          await context.prisma.usersOnOrganisations.findUnique({
            where: {
              userId_organisationId: {
                userId: args.data.driverId,
                organisationId: args.data.organisationId,
              },
            },
            select: {
              role: true,
            },
          });

        if (userOrgConnection?.role !== 'DRIVER') {
          throw new Error(
            'Unable to add infringemnt. Infringements can only be added to a driver'
          );
        }

        return context.prisma.infringement.create({
          data: {
            description: args.data.description,
            dateOccured: args.data.dateOccured,
            status: 'UNSIGNED',
            driver: {
              connect: {
                id: args.data.driverId,
              },
            },
          },
        });
      },
    });

    t.nonNull.field('updateInfringement', {
      type: Infringement,
      args: {
        data: nonNull(
          arg({
            type: UpdateInfringementInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          return context.prisma.infringement.update({
            where: {
              id: args.data.id,
            },
            data: {
              description: args.data.description,
              dateOccured: args.data.dateOccured,
              status: args.data.status,
            },
          });
        } catch (error) {
          throw new Error('Error updating infringement');
        }
      },
    });

    t.nonNull.field('deleteInfringement', {
      type: Infringement,
      args: {
        data: nonNull(
          arg({
            type: DeleteInfringementInput,
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.infringement.delete({
            where: {
              id: args.data.id,
            },
          });
        } catch (error) {
          throw new Error('Error deleting infringement');
        }
      },
    });

    t.nonNull.field('updateInfringementStatus', {
      type: Infringement,
      args: {
        data: nonNull(
          arg({
            type: UpdateInfringementStasusInput,
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.infringement.update({
            where: {
              id: args.data.id,
            },
            data: {
              status: 'SIGNED',
            },
          });
        } catch (error) {
          throw new Error('Error updating infringements status');
        }
      },
    });
  },
});

export default Infringement;

import {
  objectType,
  nonNull,
  arg,
  inputObjectType,
  extendType,
  idArg,
} from 'nexus';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
import { Organisation } from './Organisation';
import { Vehicle } from './Vehicle';

export const FuelCard = objectType({
  name: 'FuelCard',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
    t.nonNull.field('organisation', {
      type: Organisation,
      resolve: async (parent, _, context: Context) => {
        const organisation = await context.prisma.fuelCard
          .findUnique({
            where: { id: parent.id },
          })
          .organisation();

        if (!organisation) {
          throw new Error('Organisation not found');
        }

        return organisation;
      },
    });
    t.field('vehicle', {
      type: Vehicle,
      resolve(parent, _, context: Context) {
        return context.prisma.fuelCard
          .findUnique({
            where: { id: parent.id },
          })
          .vehicle();
      },
    });
  },
});

const FuelCardInputFilter = inputObjectType({
  name: 'FuelCardInputFilter',
  definition(t) {
    t.string('searchCriteria');
    t.nonNull.string('organisationId');
  },
});

export const FuelCardQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('fuelCards', {
      type: FuelCard,
      args: {
        data: nonNull(
          arg({
            type: FuelCardInputFilter,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve fuel cards. You are not logged in.'
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
            'Unable to retrieve fuel cards. You are not a member of this organisation'
          );
        }

        return context.prisma.fuelCard.findMany({
          where: {
            AND: [
              { organisationId: args.data.organisationId },
              {
                cardNumber: {
                  contains:
                    args.data?.searchCriteria != null
                      ? args.data.searchCriteria
                      : undefined,
                  mode: 'insensitive',
                },
              },
            ],
          },
          orderBy: {
            cardNumber: 'asc',
          },
        });
      },
    });

    t.list.field('fuelCardsNotAssigned', {
      type: FuelCard,
      args: {
        organisationId: nonNull(idArg()),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve unassigned fuel cards. You are not logged in.'
          );
        }

        const isInOrganisation =
          await context.prisma.usersOnOrganisations.findUnique({
            where: {
              userId_organisationId: {
                userId,
                organisationId: args.organisationId,
              },
            },
          });

        if (!isInOrganisation) {
          throw new Error(
            'Unable to retrieve fuel cards. You are not a member of this organisation'
          );
        }

        return context.prisma.fuelCard.findMany({
          where: {
            AND: [{ vehicleId: null }, { organisationId: args.organisationId }],
          },
          orderBy: {
            cardNumber: 'asc',
          },
        });
      },
    });
  },
});

const AddFuelCardInput = inputObjectType({
  name: 'AddFuelCardInput',
  definition(t) {
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
    t.nonNull.string('organisationId');
  },
});

const UpdateFuelCardInput = inputObjectType({
  name: 'UpdateFuelCardInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
  },
});

const DeleteFuelCardInput = inputObjectType({
  name: 'DeleteFuelCardInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const FuelCardMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('addFuelCard', {
      type: FuelCard,
      args: {
        data: nonNull(
          arg({
            type: AddFuelCardInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error('Unable to add fuel card. You are not logged in.');
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
            'Unable to add fuel card. You are not a member of this organisation'
          );
        }

        const existingCard = await context.prisma.fuelCard.findUnique({
          where: {
            cardNumber: args.data.cardNumber,
          },
        });

        if (existingCard) {
          throw new Error('Card already exists with this registration');
        }

        return context.prisma.fuelCard.create({
          data: {
            cardNumber: args.data.cardNumber,
            cardProvider: args.data.cardProvider,
            organisation: {
              connect: {
                id: args.data.organisationId,
              },
            },
          },
        });
      },
    });

    t.nonNull.field('updateFuelCard', {
      type: FuelCard,
      args: {
        data: nonNull(
          arg({
            type: UpdateFuelCardInput,
          })
        ),
      },
      resolve: async (_, args, context: Context) => {
        try {
          return context.prisma.fuelCard.update({
            where: {
              id: args.data.id,
            },
            data: {
              cardNumber: args.data.cardNumber,
              cardProvider: args.data.cardProvider,
            },
          });
        } catch (error) {
          throw new Error('Error updating fuel card');
        }
      },
    });

    t.nonNull.field('deleteFuelCard', {
      type: FuelCard,
      args: {
        data: nonNull(
          arg({
            type: DeleteFuelCardInput,
          })
        ),
      },
      resolve: (_, args, context: Context) => {
        try {
          return context.prisma.fuelCard.delete({
            where: {
              id: args.data.id,
            },
          });
        } catch (error) {
          throw new Error('Error deleting fuel card');
        }
      },
    });
  },
});

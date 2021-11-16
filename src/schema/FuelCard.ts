import { objectType, nonNull, arg, inputObjectType, extendType } from 'nexus';
import { Context } from '../context';
import { getUserId } from '../utilities/getUserId';
import { Vehicle } from './Vehicle';

export const FuelCard = objectType({
  name: 'FuelCard',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
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
  },
});

export const FuelCardQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('fuelCards', {
      type: FuelCard,
      args: {
        data: arg({
          type: FuelCardInputFilter,
        }),
      },
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve fuel cards. You are not logged in.'
          );
        }

        return context.prisma.fuelCard.findMany({
          where: {
            cardNumber: {
              contains:
                args.data?.searchCriteria != null
                  ? args.data.searchCriteria
                  : undefined,
              mode: 'insensitive',
            },
          },
          orderBy: {
            cardNumber: 'asc',
          },
        });
      },
    });

    t.list.field('fuelCardsNotAssigned', {
      type: FuelCard,
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        if (!userId) {
          throw new Error(
            'Unable to retrieve unassigned fuel cards. You are not logged in.'
          );
        }

        return context.prisma.fuelCard.findMany({
          where: {
            vehicleId: null,
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

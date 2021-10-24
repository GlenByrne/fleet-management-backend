import {
  objectType,
  nonNull,
  arg,
  inputObjectType,
  extendType,
  idArg,
} from 'nexus';
import { Context } from '../context';
import createConnection from '../utilities/createConnection';
import upsertConnection from '../utilities/upsertConnection';
import { Depot } from './Depot';
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
    t.field('depot', {
      type: Depot,
      resolve(parent, _, context: Context) {
        return context.prisma.fuelCard
          .findUnique({
            where: { id: parent.id },
          })
          .depot();
      },
    });
  },
});

export const FuelCardQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('fuelCards', {
      type: FuelCard,
      resolve: (_, __, context: Context) => context.prisma.fuelCard.findMany(),
    });

    t.list.field('fuelCardsNotAssigned', {
      type: FuelCard,
      resolve: (_, __, context: Context) =>
        context.prisma.fuelCard.findMany({
          where: {
            vehicleId: null,
          },
        }),
    });

    t.list.field('currentFuelCardAndUnassigned', {
      type: FuelCard,
      args: {
        vehicleId: nonNull(idArg()),
      },
      resolve: (_, { vehicleId }, context: Context) =>
        context.prisma.fuelCard.findMany({
          where: {
            OR: [
              {
                vehicleId: null,
              },
              {
                vehicleId,
              },
            ],
          },
        }),
    });
  },
});

const AddFuelCardInput = inputObjectType({
  name: 'AddFuelCardInput',
  definition(t) {
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
    t.string('depotId');
  },
});

const UpdateFuelCardInput = inputObjectType({
  name: 'UpdateFuelCardInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
    t.string('depotId');
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
      resolve: (_, args, context: Context) =>
        context.prisma.fuelCard.create({
          data: {
            cardNumber: args.data.cardNumber,
            cardProvider: args.data.cardProvider,
            ...createConnection('depot', args.data.depotId),
          },
        }),
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
        const oldFuelCard = await context.prisma.fuelCard.findUnique({
          where: {
            id: args.data.id,
          },
          include: {
            depot: {
              select: {
                id: true,
              },
            },
          },
        });

        const fuelCard = context.prisma.fuelCard.update({
          where: {
            id: args.data.id,
          },
          data: {
            cardNumber: args.data.cardNumber,
            cardProvider: args.data.cardProvider,
            ...upsertConnection(
              'depot',
              oldFuelCard?.depot?.id,
              args.data.depotId
            ),
          },
        });
        return fuelCard;
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
      resolve: (_, args, context: Context) =>
        context.prisma.fuelCard.delete({
          where: {
            id: args.data.id,
          },
        }),
    });
  },
});

import { objectType, nonNull, arg, inputObjectType, extendType } from 'nexus';
import { Context } from '../context';
import createConnection from '../utilities/createConnection';
import { getUserId } from '../utilities/getUserId';
import upsertConnection from '../utilities/upsertConnection';
import { Company } from './Company';
import { Depot } from './Depot';
import { Vehicle } from './Vehicle';

export const FuelCard = objectType({
  name: 'FuelCard',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
    t.nonNull.field('company', {
      type: Company,
      resolve: async (parent, _, context: Context) => {
        const company = await context.prisma.fuelCard
          .findUnique({
            where: { id: parent.id },
          })
          .company();

        if (!company) {
          throw new Error('Company not found');
        }

        return company;
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

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.fuelCard.findMany({
          where: {
            AND: [
              { companyId: company?.id },
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
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context);

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.fuelCard.findMany({
          where: {
            AND: [{ vehicleId: null }, { companyId: company?.id }],
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
      resolve: async (_, args, context: Context) => {
        const userId = getUserId(context);

        const company = await context.prisma.user
          .findUnique({
            where: {
              id: userId != null ? userId : undefined,
            },
          })
          .company();

        return context.prisma.fuelCard.create({
          data: {
            cardNumber: args.data.cardNumber,
            cardProvider: args.data.cardProvider,
            company: {
              connect: {
                id: company?.id,
              },
            },
            ...createConnection('depot', args.data.depotId),
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

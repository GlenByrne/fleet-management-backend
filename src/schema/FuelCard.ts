import { objectType, nonNull, arg, inputObjectType, extendType } from 'nexus';
import { Context } from '../context';

export const FuelCard = objectType({
  name: 'FuelCard',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('cardNumber');
  },
});

export const FuelCardQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('fuelCards', {
      type: FuelCard,
      resolve: (_, __, context: Context) => context.prisma.fuelCard.findMany(),
    });
  },
});

const AddFuelCardInput = inputObjectType({
  name: 'AddFuelCardInput',
  definition(t) {
    t.nonNull.string('cardNumber');
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
          },
        }),
    });
  },
});

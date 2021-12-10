import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { FuelCard } from '@/schema/schemaExports';

export const UpdateFuelCardInput = inputObjectType({
  name: 'UpdateFuelCardInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('cardNumber');
    t.nonNull.string('cardProvider');
  },
});

export const updateFuelCard = mutationField('updateFuelCard', {
  type: nonNull(FuelCard),
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

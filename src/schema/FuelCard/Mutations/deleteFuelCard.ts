import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { FuelCard } from '@/schema/schemaExports';

export const DeleteFuelCardInput = inputObjectType({
  name: 'DeleteFuelCardInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const deleteFuelCard = mutationField('deleteFuelCard', {
  type: nonNull(FuelCard),
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

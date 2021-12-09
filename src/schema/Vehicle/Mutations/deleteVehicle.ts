import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const DeleteVehicleInput = inputObjectType({
  name: 'DeleteVehicleInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const deleteVehicle = mutationField('deleteVehicle', {
  type: nonNull(Vehicle),
  args: {
    data: nonNull(
      arg({
        type: DeleteVehicleInput,
      })
    ),
  },
  resolve: (_, args, context: Context) => {
    try {
      return context.prisma.vehicle.delete({
        where: {
          id: args.data.id,
        },
      });
    } catch (error) {
      throw new Error('Error deleting vehicle');
    }
  },
});

import { queryField, nonNull, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { Vehicle } from '@/schema/schemaExports';

export const VehicleInput = inputObjectType({
  name: 'VehicleInput',
  definition(t) {
    t.nonNull.id('vehicleId');
  },
});

export const vehicle = queryField('vehicle', {
  type: Vehicle,
  args: {
    data: nonNull(
      arg({
        type: VehicleInput,
      })
    ),
  },
  resolve: (_, { data }, context: Context) => {
    try {
      return context.prisma.vehicle.findUnique({
        where: {
          id: data.vehicleId,
        },
      });
    } catch (error) {
      throw new Error('Error retrieving vehicle');
    }
  },
});

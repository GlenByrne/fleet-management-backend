import { queryField, nonNull, idArg } from 'nexus';
import { Context } from 'src/context';
import { Vehicle } from '@/schema/Vehicle/Vehicle';

export const vehicle = queryField('vehicle', {
  type: Vehicle,
  args: {
    vehicleId: nonNull(idArg()),
  },
  resolve: (_, { vehicleId }, context: Context) => {
    try {
      return context.prisma.vehicle.findUnique({
        where: {
          id: vehicleId,
        },
      });
    } catch (error) {
      throw new Error('Error retrieving vehicle');
    }
  },
});

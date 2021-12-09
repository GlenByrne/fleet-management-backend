import { queryField, nonNull, idArg, list } from 'nexus';
import { Context } from 'src/context';
import { Defect } from '@/schema/Defect/Defect';

export const defectsForVehicle = queryField('defectsForVehicle', {
  type: list(Defect),
  args: {
    vehicleId: nonNull(idArg()),
  },
  resolve: (_, { vehicleId }, context: Context) => {
    try {
      return context.prisma.vehicle
        .findUnique({
          where: {
            id: vehicleId,
          },
        })
        .defects();
    } catch (error) {
      throw new Error('There was an error retrieving defects for vehicle');
    }
  },
});

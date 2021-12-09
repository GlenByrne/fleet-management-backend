import { queryField, nonNull, idArg, list } from 'nexus';
import { Context } from 'src/context';
import { Defect } from '@/schema/Defect/Defect';

export const defectsForVehicles = queryField('defectsForVehicles', {
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
      throw new Error('Error retrieving defects');
    }
  },
});

import { queryField, nonNull, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { Defect } from '@/schema/schemaExports';

export const DefectsForVehiclesInput = inputObjectType({
  name: 'DefectsForVehiclesInput',
  definition(t) {
    t.nonNull.id('vehicleId');
  },
});

export const defectsForVehicles = queryField('defectsForVehicles', {
  type: list(Defect),
  args: {
    data: nonNull(
      arg({
        type: DefectsForVehiclesInput,
      })
    ),
  },
  resolve: (_, { data }, context: Context) => {
    try {
      return context.prisma.vehicle
        .findUnique({
          where: {
            id: data.vehicleId,
          },
        })
        .defects();
    } catch (error) {
      throw new Error('Error retrieving defects');
    }
  },
});

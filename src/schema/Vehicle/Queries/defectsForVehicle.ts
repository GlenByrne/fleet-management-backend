import { queryField, nonNull, list, inputObjectType, arg } from 'nexus';
import { Context } from 'src/context';
import { Defect } from '@/schema/schemaExports';

export const DefectsForVehicleInput = inputObjectType({
  name: 'DefectsForVehicleInput',
  definition(t) {
    t.nonNull.id('vehicleId');
  },
});

export const defectsForVehicle = queryField('defectsForVehicle', {
  type: list(Defect),
  args: {
    data: nonNull(
      arg({
        type: DefectsForVehicleInput,
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
      throw new Error('There was an error retrieving defects for vehicle');
    }
  },
});

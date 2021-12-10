import { inputObjectType, mutationField, nonNull, arg } from 'nexus';
import { Context } from 'src/context';
import { Vehicle } from '@/schema/schemaExports';

export const updateVehicleTachoCalibrationInput = inputObjectType({
  name: 'updateVehicleTachoCalibrationInput',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.date('completionDate');
  },
});

export const updateVehicleTachoCalibration = mutationField(
  'updateVehicleTachoCalibration',
  {
    type: nonNull(Vehicle),
    args: {
      data: nonNull(
        arg({
          type: updateVehicleTachoCalibrationInput,
        })
      ),
    },
    resolve: async (_, args, context: Context) => {
      const vehicle = await context.prisma.vehicle.findUnique({
        where: {
          id: args.data.id,
        },
      });

      if (!vehicle) {
        throw new Error('This vehicle does not exist.');
      }

      if (!vehicle.tachoCalibration) {
        throw new Error(
          'This vehicle does not have a thirteen week inspection due date set.'
        );
      }

      const yearsToAdd = 2;
      const completionDate = new Date(args.data.completionDate);
      const nextTachoCalibration = new Date(
        completionDate.setFullYear(completionDate.getFullYear() + yearsToAdd)
      );

      const updatedVehicle = await context.prisma.vehicle.update({
        where: {
          id: args.data.id,
        },
        data: {
          tachoCalibration: nextTachoCalibration,
        },
      });

      return updatedVehicle;
    },
  }
);
